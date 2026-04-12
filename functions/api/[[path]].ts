/// <reference types="@cloudflare/workers-types" />
import { signJWT, verifyJWT, hashPassword, generateSalt, json, error, getUserFromRequest, JWTPayload } from '../_lib/jwt';
import { calculateFreshness, calculateEntityScore, calculateInfluenceFromEdges, getEdgeWeight, EDGE_WEIGHTS } from '../_lib/scoring';
import { checkAndIncrementEdgeCount, isSpamEntity } from '../_lib/spam-guard';

interface Env {
    DB: D1Database;
    JWT_SECRET: string;
}

// ═══════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
    const method = request.method;

    console.log(`[API Request] ${method} ${path}`);

    // Debug endpoint
    if (path === 'debug') {
        return json({
            hasDB: !!env.DB,
            hasSecret: !!env.JWT_SECRET,
            envKeys: Object.keys(env),
            url: request.url,
            path: path
        });
    }

    // Health check
    if (path === 'health') {
        return json({ status: 'active', timestamp: new Date().toISOString() });
    }

    // CORS
    if (method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            }
        });
    }

    try {
        // ─── Public Routes ────────────────────────────────────
        if (method === 'POST' && path === 'auth/register') return handleRegister(env, request);
        if (method === 'POST' && path === 'auth/login') return handleLogin(env, request);

        // ─── Protected Routes ─────────────────────────────────
        const user = await getUserFromRequest(request, env.JWT_SECRET);
        if (!user) return error('Unauthorized', 401);

        // Auth
        if (method === 'GET' && path === 'auth/session') return handleSession(env, user);
        if (method === 'PUT' && path === 'auth/profile') return handleUpdateProfile(env, request, user);

        // User profile
        const userProfileMatch = path.match(/^users\/([^/]+)$/);
        if (method === 'GET' && userProfileMatch) return handleGetUserProfile(env, userProfileMatch[1]);

        // Feed
        if (method === 'GET' && path === 'feed') return handleSmartFeed(env, url, user);
        if (method === 'GET' && path === 'feed/following') return handleFollowingFeed(env, url, user);
        const communityFeedMatch = path.match(/^feed\/community\/([^/]+)$/);
        if (method === 'GET' && communityFeedMatch) return handleCommunityFeed(env, url, communityFeedMatch[1]);

        // Posts
        if (method === 'POST' && path === 'posts') return handleCreatePost(env, request, user);
        const postIdMatch = path.match(/^posts\/([^/]+)$/);
        if (postIdMatch) {
            if (method === 'GET') return handleGetPost(env, postIdMatch[1]);
            if (method === 'DELETE') return handleDeletePost(env, postIdMatch[1], user);
        }
        const postCommentsMatch = path.match(/^posts\/([^/]+)\/comments$/);
        if (method === 'GET' && postCommentsMatch) return handleGetComments(env, postCommentsMatch[1]);

        // Interactions
        const likeMatch = path.match(/^interact\/like\/([^/]+)$/);
        if (method === 'POST' && likeMatch) return handleLike(env, likeMatch[1], user);
        const unlikeMatch = path.match(/^interact\/unlike\/([^/]+)$/);
        if (method === 'POST' && unlikeMatch) return handleUnlike(env, unlikeMatch[1], user);
        const replyMatch = path.match(/^interact\/reply\/([^/]+)$/);
        if (method === 'POST' && replyMatch) return handleReply(env, request, replyMatch[1], user);
        const shareMatch = path.match(/^interact\/share\/([^/]+)$/);
        if (method === 'POST' && shareMatch) return handleShare(env, shareMatch[1], user);
        const followMatch = path.match(/^interact\/follow\/([^/]+)$/);
        if (method === 'POST' && followMatch) return handleFollow(env, followMatch[1], user);
        const unfollowMatch = path.match(/^interact\/unfollow\/([^/]+)$/);
        if (method === 'POST' && unfollowMatch) return handleUnfollow(env, unfollowMatch[1], user);
        const reportMatch = path.match(/^interact\/report\/([^/]+)$/);
        if (method === 'POST' && reportMatch) return handleReport(env, request, reportMatch[1], user);

        // Communities
        if (method === 'GET' && path === 'communities') return handleGetCommunities(env);
        if (method === 'POST' && path === 'communities') return handleCreateCommunity(env, request, user);
        const communityJoinMatch = path.match(/^communities\/([^/]+)\/join$/);
        if (method === 'POST' && communityJoinMatch) return handleJoinCommunity(env, communityJoinMatch[1], user);
        const communityLeaveMatch = path.match(/^communities\/([^/]+)\/leave$/);
        if (method === 'POST' && communityLeaveMatch) return handleLeaveCommunity(env, communityLeaveMatch[1], user);

        // Leaderboard
        if (method === 'GET' && path === 'leaderboard') return handleLeaderboard(env, url);
        const platformMatch = path.match(/^leaderboard\/platform\/([^/]+)$/);
        if (method === 'GET' && platformMatch) return handleLeaderboardByPlatform(env, platformMatch[1]);

        // Chat
        if (method === 'POST' && path === 'chat/send') return handleChatSend(env, request, user);
        if (method === 'GET' && path === 'chat/rooms') return handleChatRooms(env, user);
        const chatRoomMatch = path.match(/^chat\/room\/([^/]+)$/);
        if (method === 'GET' && chatRoomMatch) return handleChatRoom(env, chatRoomMatch[1], url);

        return error('Not found', 404);
    } catch (e: any) {
        console.error('Server error:', e);
        return error(e.message || 'Server error', 500);
    }
};

// ═══════════════════════════════════════════════════════════════
// AUTH HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleRegister(env: Env, request: Request) {
    const { username, password } = await request.json() as any;
    if (!username || !password) return error('Username and password required');
    if (username.length < 3) return error('Username must be at least 3 characters');
    if (password.length < 4) return error('Password must be at least 4 characters');

    const existing = await env.DB.prepare('SELECT id FROM profiles WHERE username = ?').bind(username).first();
    if (existing) return error('Username already taken');

    const id = crypto.randomUUID();
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    // Create profile
    await env.DB.prepare(
        'INSERT INTO profiles (id, username, password_hash, salt, display_name) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, username, passwordHash, salt, username).run();

    // Create user_profile entity (used as follow target)
    const entityId = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO entities (id, type, owner_id, metadata) VALUES (?, ?, ?, ?)'
    ).bind(entityId, 'user_profile', id, JSON.stringify({ username })).run();

    const token = await signJWT({
        sub: id, username,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
    }, env.JWT_SECRET);

    return json({
        token,
        user: {
            id, username, displayName: username, avatarUrl: '', bio: '',
            gamingPlatform: '', influenceScore: 0, isOnboarded: false,
            country: 'Global', language: 'en'
        }
    });
}

async function handleLogin(env: Env, request: Request) {
    const { username, password } = await request.json() as any;
    if (!username || !password) return error('Username and password required');

    const record = await env.DB.prepare('SELECT * FROM profiles WHERE username = ?').bind(username).first() as any;
    if (!record) return error('User not found');

    const hash = await hashPassword(password, record.salt);
    if (hash !== record.password_hash) return error('Invalid password');

    const token = await signJWT({
        sub: record.id, username: record.username,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
    }, env.JWT_SECRET);

    return json({
        token,
        user: mapProfileToUser(record)
    });
}

async function handleSession(env: Env, jwt: JWTPayload) {
    const record = await env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(jwt.sub).first() as any;
    if (!record) return error('User not found', 404);

    // Update influence inline
    await updateInfluenceScore(env.DB, jwt.sub);
    const updated = await env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(jwt.sub).first() as any;

    return json({ user: mapProfileToUser(updated) });
}

async function handleUpdateProfile(env: Env, request: Request, jwt: JWTPayload) {
    const data = await request.json() as any;
    const sets: string[] = [];
    const vals: any[] = [];

    const fields: Record<string, string> = {
        displayName: 'display_name', avatarUrl: 'avatar_url', country: 'country',
        language: 'language', bio: 'bio', gamingPlatform: 'gaming_platform'
    };

    for (const [jsKey, dbKey] of Object.entries(fields)) {
        if (data[jsKey] !== undefined) {
            sets.push(`${dbKey} = ?`);
            vals.push(data[jsKey]);
        }
    }

    if (data.isOnboarded !== undefined) {
        sets.push('is_onboarded = ?');
        vals.push(data.isOnboarded ? 1 : 0);
    }

    if (sets.length === 0) return error('No fields to update');

    vals.push(jwt.sub);
    await env.DB.prepare(`UPDATE profiles SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();

    const record = await env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(jwt.sub).first() as any;
    return json({ user: mapProfileToUser(record) });
}

async function handleGetUserProfile(env: Env, userId: string) {
    const record = await env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(userId).first() as any;
    if (!record) return error('User not found', 404);

    // Update influence inline
    await updateInfluenceScore(env.DB, userId);
    const updated = await env.DB.prepare('SELECT * FROM profiles WHERE id = ?').bind(userId).first() as any;

    // Get stats
    const postCount = await env.DB.prepare(
        "SELECT COUNT(*) as c FROM entities WHERE owner_id = ? AND type = 'post'"
    ).bind(userId).first() as any;

    const followerCount = await env.DB.prepare(
        "SELECT COUNT(*) as c FROM edges WHERE to_entity IN (SELECT id FROM entities WHERE owner_id = ? AND type = 'user_profile') AND type = 'follow'"
    ).bind(userId).first() as any;

    const followingCount = await env.DB.prepare(
        "SELECT COUNT(*) as c FROM edges WHERE from_user = ? AND type = 'follow'"
    ).bind(userId).first() as any;

    return json({
        profile: {
            ...mapProfileToUser(updated),
            postCount: postCount?.c || 0,
            followerCount: followerCount?.c || 0,
            followingCount: followingCount?.c || 0,
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// FEED HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleSmartFeed(env: Env, url: URL, jwt: JWTPayload) {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get all post entities with their owner info, ordered by recency as base
    const posts = await env.DB.prepare(`
        SELECT e.id, e.type, e.owner_id, e.metadata, e.created_at,
               p.display_name, p.avatar_url, p.influence_score, p.username, p.gaming_platform
        FROM entities e
        JOIN profiles p ON e.owner_id = p.id
        WHERE e.type = 'post'
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
    `).bind(limit + 20, offset).all(); // Fetch extra for scoring reorder

    const results = posts.results || [];

    // Score each post
    const scoredPosts = await Promise.all(results.map(async (post: any) => {
        const edges = await env.DB.prepare(
            'SELECT weight, created_at FROM edges WHERE to_entity = ?'
        ).bind(post.id).all();

        const edgeList = (edges.results || []) as Array<{ weight: number; created_at: string }>;
        const score = calculateEntityScore(edgeList, post.influence_score);
        const meta = safeParseJSON(post.metadata);

        // Get interaction counts
        const likeCount = edgeList.filter((e: any) => e.type === 'like' || true).length;
        const likes = await env.DB.prepare(
            "SELECT COUNT(*) as c FROM edges WHERE to_entity = ? AND type = 'like'"
        ).bind(post.id).first() as any;
        const replies = await env.DB.prepare(
            "SELECT COUNT(*) as c FROM edges WHERE to_entity = ? AND type = 'reply'"
        ).bind(post.id).first() as any;
        const shares = await env.DB.prepare(
            "SELECT COUNT(*) as c FROM edges WHERE to_entity = ? AND type = 'share'"
        ).bind(post.id).first() as any;

        // Check if current user has liked
        const userLiked = await env.DB.prepare(
            "SELECT id FROM edges WHERE from_user = ? AND to_entity = ? AND type = 'like'"
        ).bind(jwt.sub, post.id).first();

        return {
            id: post.id,
            type: post.type,
            ownerId: post.owner_id,
            content: meta.content || '',
            mediaUrl: meta.media_url || '',
            gameTag: meta.game_tag || 'Global',
            createdAt: post.created_at,
            ownerName: post.display_name || post.username,
            ownerAvatar: post.avatar_url || '',
            ownerInfluence: post.influence_score || 0,
            ownerPlatform: post.gaming_platform || '',
            score,
            likeCount: likes?.c || 0,
            replyCount: replies?.c || 0,
            shareCount: shares?.c || 0,
            userLiked: !!userLiked,
        };
    }));

    // Sort by score descending then take limit
    scoredPosts.sort((a, b) => b.score - a.score);
    const feed = scoredPosts.slice(0, limit);

    return json({ posts: feed });
}

async function handleFollowingFeed(env: Env, url: URL, jwt: JWTPayload) {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get IDs of users this user follows
    const followEdges = await env.DB.prepare(`
        SELECT ent.owner_id
        FROM edges e
        JOIN entities ent ON e.to_entity = ent.id
        WHERE e.from_user = ? AND e.type = 'follow' AND ent.type = 'user_profile'
    `).bind(jwt.sub).all();

    const followedIds = (followEdges.results || []).map((r: any) => r.owner_id);

    if (followedIds.length === 0) {
        return json({ posts: [] });
    }

    // Get posts from followed users
    const placeholders = followedIds.map(() => '?').join(',');
    const posts = await env.DB.prepare(`
        SELECT e.id, e.type, e.owner_id, e.metadata, e.created_at,
               p.display_name, p.avatar_url, p.influence_score, p.username, p.gaming_platform
        FROM entities e
        JOIN profiles p ON e.owner_id = p.id
        WHERE e.type = 'post' AND e.owner_id IN (${placeholders})
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
    `).bind(...followedIds, limit, offset).all();

    const results = posts.results || [];
    const feed = await enrichPosts(env.DB, results, jwt.sub);

    return json({ posts: feed });
}

async function handleCommunityFeed(env: Env, url: URL, communityId: string) {
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Get community game_tag
    const community = await env.DB.prepare('SELECT game_tag FROM communities WHERE id = ?').bind(communityId).first() as any;
    if (!community) return error('Community not found', 404);

    // Get posts tagged with this community's game
    const posts = await env.DB.prepare(`
        SELECT e.id, e.type, e.owner_id, e.metadata, e.created_at,
               p.display_name, p.avatar_url, p.influence_score, p.username, p.gaming_platform
        FROM entities e
        JOIN profiles p ON e.owner_id = p.id
        WHERE e.type = 'post' AND json_extract(e.metadata, '$.game_tag') = ?
        ORDER BY e.created_at DESC
        LIMIT ?
    `).bind(community.game_tag, limit).all();

    const results = posts.results || [];
    const feed = await enrichPosts(env.DB, results, '');

    return json({ posts: feed, community });
}

// ═══════════════════════════════════════════════════════════════
// POST HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCreatePost(env: Env, request: Request, jwt: JWTPayload) {
    const { content, gameTag, mediaUrl } = await request.json() as any;
    if (!content?.trim()) return error('Content required');

    // Spam check
    const spamCheck = await checkAndIncrementEdgeCount(env.DB, jwt.sub);
    if (!spamCheck.allowed) return error('Daily interaction limit reached. Try again tomorrow.', 429);

    const user = await env.DB.prepare('SELECT display_name, username FROM profiles WHERE id = ?').bind(jwt.sub).first() as any;
    if (!user) return error('User not found', 404);

    // Create entity
    const entityId = crypto.randomUUID();
    const metadata = JSON.stringify({
        content,
        media_url: mediaUrl || '',
        game_tag: gameTag || 'Global'
    });

    await env.DB.prepare(
        'INSERT INTO entities (id, type, owner_id, metadata) VALUES (?, ?, ?, ?)'
    ).bind(entityId, 'post', jwt.sub, metadata).run();

    // Create 'create' edge
    const edgeId = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO edges (id, from_user, to_entity, type, weight) VALUES (?, ?, ?, ?, ?)'
    ).bind(edgeId, jwt.sub, entityId, 'create', EDGE_WEIGHTS.create).run();

    return json({
        post: {
            id: entityId,
            type: 'post',
            ownerId: jwt.sub,
            content,
            mediaUrl: mediaUrl || '',
            gameTag: gameTag || 'Global',
            createdAt: new Date().toISOString(),
            ownerName: user.display_name || user.username,
            ownerAvatar: '',
            ownerInfluence: 0,
            score: 0,
            likeCount: 0,
            replyCount: 0,
            shareCount: 0,
            userLiked: false,
        }
    }, 201);
}

async function handleGetPost(env: Env, postId: string) {
    const entity = await env.DB.prepare(`
        SELECT e.*, p.display_name, p.avatar_url, p.influence_score, p.username, p.gaming_platform
        FROM entities e
        JOIN profiles p ON e.owner_id = p.id
        WHERE e.id = ? AND e.type = 'post'
    `).bind(postId).first() as any;

    if (!entity) return error('Post not found', 404);

    const enriched = (await enrichPosts(env.DB, [entity], ''))[0];
    return json({ post: enriched });
}

async function handleDeletePost(env: Env, postId: string, jwt: JWTPayload) {
    const entity = await env.DB.prepare('SELECT owner_id FROM entities WHERE id = ?').bind(postId).first() as any;
    if (!entity) return error('Post not found', 404);
    if (entity.owner_id !== jwt.sub) return error('Not authorized', 403);

    // Delete all edges pointing to this entity
    await env.DB.prepare('DELETE FROM edges WHERE to_entity = ?').bind(postId).run();
    // Delete the entity
    await env.DB.prepare('DELETE FROM entities WHERE id = ?').bind(postId).run();

    return json({ success: true });
}

async function handleGetComments(env: Env, postId: string) {
    // Comments are entities with metadata.parent_entity_id = postId
    // Connected via 'reply' edges
    const comments = await env.DB.prepare(`
        SELECT e.id, e.metadata, e.created_at, e.owner_id,
               p.display_name, p.avatar_url, p.username, p.influence_score
        FROM edges ed
        JOIN entities e ON e.id = ed.to_entity OR (e.owner_id = ed.from_user AND e.type = 'comment')
        JOIN profiles p ON e.owner_id = p.id
        WHERE ed.to_entity = ? AND ed.type = 'reply'
        ORDER BY e.created_at ASC
    `).bind(postId).all();

    // Alternative simpler query: get comment entities by parent
    const commentEntities = await env.DB.prepare(`
        SELECT e.id, e.metadata, e.created_at, e.owner_id,
               p.display_name, p.avatar_url, p.username, p.influence_score
        FROM entities e
        JOIN profiles p ON e.owner_id = p.id
        WHERE e.type = 'comment' AND json_extract(e.metadata, '$.parent_entity_id') = ?
        ORDER BY e.created_at ASC
    `).bind(postId).all();

    const results = (commentEntities.results || []).map((c: any) => {
        const meta = safeParseJSON(c.metadata);
        return {
            id: c.id,
            content: meta.content || '',
            createdAt: c.created_at,
            ownerId: c.owner_id,
            ownerName: c.display_name || c.username,
            ownerAvatar: c.avatar_url || '',
            ownerInfluence: c.influence_score || 0,
        };
    });

    return json({ comments: results });
}

// ═══════════════════════════════════════════════════════════════
// INTERACTION HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleLike(env: Env, entityId: string, jwt: JWTPayload) {
    return createEdge(env, jwt.sub, entityId, 'like');
}

async function handleUnlike(env: Env, entityId: string, jwt: JWTPayload) {
    await env.DB.prepare(
        "DELETE FROM edges WHERE from_user = ? AND to_entity = ? AND type = 'like'"
    ).bind(jwt.sub, entityId).run();
    return json({ success: true });
}

async function handleReply(env: Env, request: Request, parentEntityId: string, jwt: JWTPayload) {
    const { content } = await request.json() as any;
    if (!content?.trim()) return error('Content required');

    // Spam check
    const spamCheck = await checkAndIncrementEdgeCount(env.DB, jwt.sub);
    if (!spamCheck.allowed) return error('Daily interaction limit reached', 429);

    // Create comment entity
    const commentId = crypto.randomUUID();
    const metadata = JSON.stringify({ content, parent_entity_id: parentEntityId });
    await env.DB.prepare(
        'INSERT INTO entities (id, type, owner_id, metadata) VALUES (?, ?, ?, ?)'
    ).bind(commentId, 'comment', jwt.sub, metadata).run();

    // Create reply edge to parent
    const edgeId = crypto.randomUUID();
    try {
        await env.DB.prepare(
            'INSERT INTO edges (id, from_user, to_entity, type, weight) VALUES (?, ?, ?, ?, ?)'
        ).bind(edgeId, jwt.sub, parentEntityId, 'reply', EDGE_WEIGHTS.reply).run();
    } catch (e) {
        // Duplicate edge — user already replied, just add another comment entity
    }

    // Also create 'create' edge for the comment
    const createEdgeId = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO edges (id, from_user, to_entity, type, weight) VALUES (?, ?, ?, ?, ?)'
    ).bind(createEdgeId, jwt.sub, commentId, 'create', EDGE_WEIGHTS.create).run();

    const user = await env.DB.prepare('SELECT display_name, avatar_url, username, influence_score FROM profiles WHERE id = ?').bind(jwt.sub).first() as any;

    return json({
        comment: {
            id: commentId,
            content,
            createdAt: new Date().toISOString(),
            ownerId: jwt.sub,
            ownerName: user?.display_name || user?.username || '',
            ownerAvatar: user?.avatar_url || '',
            ownerInfluence: user?.influence_score || 0,
        }
    }, 201);
}

async function handleShare(env: Env, entityId: string, jwt: JWTPayload) {
    return createEdge(env, jwt.sub, entityId, 'share');
}

async function handleFollow(env: Env, targetUserId: string, jwt: JWTPayload) {
    if (targetUserId === jwt.sub) return error('Cannot follow yourself');

    // Find or create target's user_profile entity
    let targetEntity = await env.DB.prepare(
        "SELECT id FROM entities WHERE owner_id = ? AND type = 'user_profile'"
    ).bind(targetUserId).first() as any;

    if (!targetEntity) {
        const entityId = crypto.randomUUID();
        await env.DB.prepare(
            'INSERT INTO entities (id, type, owner_id, metadata) VALUES (?, ?, ?, ?)'
        ).bind(entityId, 'user_profile', targetUserId, '{}').run();
        targetEntity = { id: entityId };
    }

    return createEdge(env, jwt.sub, targetEntity.id, 'follow');
}

async function handleUnfollow(env: Env, targetUserId: string, jwt: JWTPayload) {
    // Find target's user_profile entity
    const targetEntity = await env.DB.prepare(
        "SELECT id FROM entities WHERE owner_id = ? AND type = 'user_profile'"
    ).bind(targetUserId).first() as any;

    if (targetEntity) {
        await env.DB.prepare(
            "DELETE FROM edges WHERE from_user = ? AND to_entity = ? AND type = 'follow'"
        ).bind(jwt.sub, targetEntity.id).run();
    }

    return json({ success: true });
}

async function handleReport(env: Env, request: Request, entityId: string, jwt: JWTPayload) {
    const { reason } = await request.json() as any;
    
    const spamCheck = await checkAndIncrementEdgeCount(env.DB, jwt.sub);
    if (!spamCheck.allowed) return error('Daily interaction limit reached', 429);

    const edgeId = crypto.randomUUID();
    try {
        await env.DB.prepare(
            'INSERT INTO edges (id, from_user, to_entity, type, weight, context) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(edgeId, jwt.sub, entityId, 'report', EDGE_WEIGHTS.report, JSON.stringify({ reason: reason || '' })).run();
    } catch (e) {
        return error('Already reported');
    }

    return json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// COMMUNITY HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleGetCommunities(env: Env) {
    const communities = await env.DB.prepare(`
        SELECT c.*,
            (SELECT COUNT(*) FROM edges WHERE to_entity IN 
                (SELECT id FROM entities WHERE type = 'community' AND json_extract(metadata, '$.community_id') = c.id)
                AND type = 'join') as member_count
        FROM communities c
        ORDER BY c.created_at DESC
    `).all();

    // Simpler approach: count join edges for community entities
    const results = communities.results || [];
    const enriched = await Promise.all(results.map(async (c: any) => {
        const communityEntity = await env.DB.prepare(
            "SELECT id FROM entities WHERE type = 'community' AND owner_id = ? AND json_extract(metadata, '$.community_id') = ?"
        ).bind(c.creator_id, c.id).first() as any;

        let memberCount = 0;
        if (communityEntity) {
            const count = await env.DB.prepare(
                "SELECT COUNT(*) as c FROM edges WHERE to_entity = ? AND type = 'join'"
            ).bind(communityEntity.id).first() as any;
            memberCount = count?.c || 0;
        }

        return {
            id: c.id,
            name: c.name,
            description: c.description,
            gameTag: c.game_tag,
            creatorId: c.creator_id,
            createdAt: c.created_at,
            memberCount: memberCount + 1, // +1 for creator
        };
    }));

    return json({ communities: enriched });
}

async function handleCreateCommunity(env: Env, request: Request, jwt: JWTPayload) {
    const { name, description, gameTag } = await request.json() as any;
    if (!name?.trim()) return error('Name required');

    const id = crypto.randomUUID();
    try {
        await env.DB.prepare(
            'INSERT INTO communities (id, name, description, game_tag, creator_id) VALUES (?, ?, ?, ?, ?)'
        ).bind(id, name, description || '', gameTag || '', jwt.sub).run();
    } catch (e) {
        return error('Community name already taken');
    }

    // Create community entity (for edges)
    const entityId = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO entities (id, type, owner_id, metadata) VALUES (?, ?, ?, ?)'
    ).bind(entityId, 'community', jwt.sub, JSON.stringify({ community_id: id, name, game_tag: gameTag || '' })).run();

    return json({
        community: { id, name, description: description || '', gameTag: gameTag || '', creatorId: jwt.sub, memberCount: 1 }
    }, 201);
}

async function handleJoinCommunity(env: Env, communityId: string, jwt: JWTPayload) {
    // Find community entity
    const communityEntity = await env.DB.prepare(
        "SELECT id FROM entities WHERE type = 'community' AND json_extract(metadata, '$.community_id') = ?"
    ).bind(communityId).first() as any;

    if (!communityEntity) return error('Community not found', 404);

    return createEdge(env, jwt.sub, communityEntity.id, 'join');
}

async function handleLeaveCommunity(env: Env, communityId: string, jwt: JWTPayload) {
    const communityEntity = await env.DB.prepare(
        "SELECT id FROM entities WHERE type = 'community' AND json_extract(metadata, '$.community_id') = ?"
    ).bind(communityId).first() as any;

    if (communityEntity) {
        await env.DB.prepare(
            "DELETE FROM edges WHERE from_user = ? AND to_entity = ? AND type = 'join'"
        ).bind(jwt.sub, communityEntity.id).run();
    }

    return json({ success: true });
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleLeaderboard(env: Env, url: URL) {
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const users = await env.DB.prepare(`
        SELECT id, username, display_name, avatar_url, gaming_platform, influence_score, created_at
        FROM profiles
        ORDER BY influence_score DESC
        LIMIT ?
    `).bind(limit).all();

    return json({
        leaderboard: (users.results || []).map((u: any, i: number) => ({
            rank: i + 1,
            id: u.id,
            username: u.username,
            displayName: u.display_name,
            avatarUrl: u.avatar_url,
            gamingPlatform: u.gaming_platform,
            influenceScore: u.influence_score,
            createdAt: u.created_at,
        }))
    });
}

async function handleLeaderboardByPlatform(env: Env, platform: string) {
    const users = await env.DB.prepare(`
        SELECT id, username, display_name, avatar_url, gaming_platform, influence_score
        FROM profiles
        WHERE gaming_platform = ?
        ORDER BY influence_score DESC
        LIMIT 20
    `).bind(platform).all();

    return json({
        leaderboard: (users.results || []).map((u: any, i: number) => ({
            rank: i + 1,
            id: u.id,
            username: u.username,
            displayName: u.display_name,
            avatarUrl: u.avatar_url,
            gamingPlatform: u.gaming_platform,
            influenceScore: u.influence_score,
        }))
    });
}

// ═══════════════════════════════════════════════════════════════
// CHAT HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleChatSend(env: Env, request: Request, jwt: JWTPayload) {
    const { content, roomId } = await request.json() as any;
    if (!content?.trim()) return error('Content required');
    if (!roomId) return error('Room ID required');

    // Spam check
    const spamCheck = await checkAndIncrementEdgeCount(env.DB, jwt.sub);
    if (!spamCheck.allowed) return error('Daily interaction limit reached', 429);

    const user = await env.DB.prepare('SELECT display_name, avatar_url, username FROM profiles WHERE id = ?').bind(jwt.sub).first() as any;

    // Create message entity
    const entityId = crypto.randomUUID();
    const metadata = JSON.stringify({ content, room_id: roomId });
    await env.DB.prepare(
        'INSERT INTO entities (id, type, owner_id, metadata) VALUES (?, ?, ?, ?)'
    ).bind(entityId, 'message', jwt.sub, metadata).run();

    // Create 'send' edge
    const edgeId = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO edges (id, from_user, to_entity, type, weight) VALUES (?, ?, ?, ?, ?)'
    ).bind(edgeId, jwt.sub, entityId, 'send', EDGE_WEIGHTS.send).run();

    return json({
        message: {
            id: entityId,
            content,
            roomId,
            createdAt: new Date().toISOString(),
            ownerId: jwt.sub,
            ownerName: user?.display_name || user?.username || '',
            ownerAvatar: user?.avatar_url || '',
        }
    }, 201);
}

async function handleChatRoom(env: Env, roomId: string, url: URL) {
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const after = url.searchParams.get('after');

    let query = `
        SELECT e.id, e.metadata, e.created_at, e.owner_id,
               p.display_name, p.avatar_url, p.username
        FROM entities e
        JOIN profiles p ON e.owner_id = p.id
        WHERE e.type = 'message' AND json_extract(e.metadata, '$.room_id') = ?
    `;
    const params: any[] = [roomId];

    if (after) {
        query += ' AND e.created_at > ?';
        params.push(after);
    }

    query += ' ORDER BY e.created_at ASC LIMIT ?';
    params.push(limit);

    const messages = await env.DB.prepare(query).bind(...params).all();

    const results = (messages.results || []).map((m: any) => {
        const meta = safeParseJSON(m.metadata);
        return {
            id: m.id,
            content: meta.content || '',
            roomId: meta.room_id || roomId,
            createdAt: m.created_at,
            ownerId: m.owner_id,
            ownerName: m.display_name || m.username,
            ownerAvatar: m.avatar_url || '',
        };
    });

    return json({ messages: results });
}

async function handleChatRooms(env: Env, jwt: JWTPayload) {
    // Get distinct room_ids from messages sent by or involving this user
    const rooms = await env.DB.prepare(`
        SELECT DISTINCT json_extract(e.metadata, '$.room_id') as room_id,
               MAX(e.created_at) as last_message_at
        FROM entities e
        WHERE e.type = 'message' AND (
            e.owner_id = ? OR 
            json_extract(e.metadata, '$.room_id') IN (
                SELECT DISTINCT json_extract(e2.metadata, '$.room_id')
                FROM entities e2 WHERE e2.type = 'message' AND e2.owner_id = ?
            )
        )
        GROUP BY room_id
        ORDER BY last_message_at DESC
    `).bind(jwt.sub, jwt.sub).all();

    return json({ rooms: (rooms.results || []).map((r: any) => ({ roomId: r.room_id, lastMessageAt: r.last_message_at })) });
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** Create an edge with spam check and duplicate prevention */
async function createEdge(env: Env, fromUser: string, toEntity: string, type: string) {
    // Verify entity exists
    const entity = await env.DB.prepare('SELECT id FROM entities WHERE id = ?').bind(toEntity).first();
    if (!entity) return error('Entity not found', 404);

    // Spam check
    const spamCheck = await checkAndIncrementEdgeCount(env.DB, fromUser);
    if (!spamCheck.allowed) return error('Daily interaction limit reached', 429);

    const edgeId = crypto.randomUUID();
    const weight = getEdgeWeight(type);

    try {
        await env.DB.prepare(
            'INSERT INTO edges (id, from_user, to_entity, type, weight) VALUES (?, ?, ?, ?, ?)'
        ).bind(edgeId, fromUser, toEntity, type, weight).run();
    } catch (e: any) {
        // UNIQUE constraint violation — duplicate edge
        if (e.message?.includes('UNIQUE')) {
            return error(`Already ${type}d`, 409);
        }
        throw e;
    }

    // Update owner's influence score inline
    const entityRecord = await env.DB.prepare('SELECT owner_id FROM entities WHERE id = ?').bind(toEntity).first() as any;
    if (entityRecord) {
        await updateInfluenceScore(env.DB, entityRecord.owner_id);
    }

    return json({ success: true, remaining: spamCheck.remaining });
}

/** Update a user's influence score based on incoming edges */
async function updateInfluenceScore(db: D1Database, userId: string) {
    const edges = await db.prepare(`
        SELECT ed.weight, ed.created_at
        FROM edges ed
        JOIN entities e ON ed.to_entity = e.id
        WHERE e.owner_id = ? AND ed.from_user != ?
    `).bind(userId, userId).all();

    const edgeList = (edges.results || []) as Array<{ weight: number; created_at: string }>;
    const influence = calculateInfluenceFromEdges(edgeList);

    await db.prepare('UPDATE profiles SET influence_score = ? WHERE id = ?').bind(influence, userId).run();
}

/** Enrich post entities with score and interaction counts */
async function enrichPosts(db: D1Database, posts: any[], currentUserId: string) {
    return Promise.all(posts.map(async (post: any) => {
        const meta = safeParseJSON(post.metadata);

        const likes = await db.prepare(
            "SELECT COUNT(*) as c FROM edges WHERE to_entity = ? AND type = 'like'"
        ).bind(post.id).first() as any;
        const replies = await db.prepare(
            "SELECT COUNT(*) as c FROM edges WHERE to_entity = ? AND type = 'reply'"
        ).bind(post.id).first() as any;
        const shares = await db.prepare(
            "SELECT COUNT(*) as c FROM edges WHERE to_entity = ? AND type = 'share'"
        ).bind(post.id).first() as any;

        let userLiked = false;
        if (currentUserId) {
            const liked = await db.prepare(
                "SELECT id FROM edges WHERE from_user = ? AND to_entity = ? AND type = 'like'"
            ).bind(currentUserId, post.id).first();
            userLiked = !!liked;
        }

        const edgesData = await db.prepare(
            'SELECT weight, created_at FROM edges WHERE to_entity = ?'
        ).bind(post.id).all();
        const score = calculateEntityScore(
            (edgesData.results || []) as Array<{ weight: number; created_at: string }>,
            post.influence_score || 0
        );

        return {
            id: post.id,
            type: post.type || 'post',
            ownerId: post.owner_id,
            content: meta.content || '',
            mediaUrl: meta.media_url || '',
            gameTag: meta.game_tag || 'Global',
            createdAt: post.created_at,
            ownerName: post.display_name || post.username,
            ownerAvatar: post.avatar_url || '',
            ownerInfluence: post.influence_score || 0,
            ownerPlatform: post.gaming_platform || '',
            score,
            likeCount: likes?.c || 0,
            replyCount: replies?.c || 0,
            shareCount: shares?.c || 0,
            userLiked,
        };
    }));
}

/** Map a DB profile record to a frontend User object */
function mapProfileToUser(record: any) {
    return {
        id: record.id,
        username: record.username,
        displayName: record.display_name || record.username,
        avatarUrl: record.avatar_url || '',
        bio: record.bio || '',
        gamingPlatform: record.gaming_platform || '',
        influenceScore: record.influence_score || 0,
        isOnboarded: !!record.is_onboarded,
        country: record.country || 'Global',
        language: record.language || 'en',
    };
}

/** Safely parse JSON, returning empty object on failure */
function safeParseJSON(str: string | null | undefined): any {
    try {
        return JSON.parse(str || '{}');
    } catch {
        return {};
    }
}
