import { signJWT, verifyJWT, hashPassword, generateSalt, json, error, getUserFromRequest, JWTPayload } from '../_lib/jwt';

interface Env {
    DB: D1Database;
    JWT_SECRET: string;
}

// ─── Router ────────────────────────────────────────────────
export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', '');
    const method = request.method;

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
        // Public routes (no auth required)
        if (method === 'POST' && path === 'auth/register') return handleRegister(env, request);
        if (method === 'POST' && path === 'auth/login') return handleLogin(env, request);

        // Protected routes
        const user = await getUserFromRequest(request, env.JWT_SECRET);
        if (!user) return error('Unauthorized', 401);

        if (method === 'GET' && path === 'auth/session') return handleSession(env, user);
        if (method === 'PUT' && path === 'auth/profile') return handleUpdateProfile(env, request, user);

        if (method === 'GET' && path === 'posts') return handleGetPosts(env, url);
        if (method === 'POST' && path === 'posts') return handleCreatePost(env, request, user);
        if (method === 'GET' && path === 'explore') return handleExplore(env, url);

        const postWow = path.match(/^posts\/([^/]+)\/wow$/);
        if (method === 'POST' && postWow) return handleWowPost(env, postWow[1]);

        const postComments = path.match(/^posts\/([^/]+)\/comments$/);
        if (postComments) {
            if (method === 'GET') return handleGetComments(env, postComments[1]);
            if (method === 'POST') return handleAddComment(env, request, user, postComments[1]);
        }

        if (method === 'GET' && path === 'communities') return handleGetCommunities(env, user);
        if (method === 'POST' && path === 'communities') return handleCreateCommunity(env, request, user);

        const commJoin = path.match(/^communities\/([^/]+)\/join$/);
        if (method === 'POST' && commJoin) return handleJoinCommunity(env, user, commJoin[1]);

        const commKick = path.match(/^communities\/([^/]+)\/kick$/);
        if (method === 'POST' && commKick) return handleKickMember(env, request, user, commKick[1]);

        const commUpdate = path.match(/^communities\/([^/]+)$/);
        if (method === 'PUT' && commUpdate) return handleUpdateCommunity(env, request, user, commUpdate[1]);

        if (method === 'GET' && path === 'groups') return handleGetGroups(env, user);
        if (method === 'POST' && path === 'groups') return handleCreateGroup(env, request, user);

        if (method === 'GET' && path === 'messages') return handleGetMessages(env, url);
        if (method === 'POST' && path === 'messages') return handleSendMessage(env, request, user);

        return error('Not found', 404);
    } catch (e: any) {
        return error(e.message || 'Server error', 500);
    }
};

// ─── Auth Handlers ─────────────────────────────────────────

async function handleRegister(env: Env, request: Request) {
    const { username, password } = await request.json() as any;
    if (!username || !password) return error('Username and password required');
    if (username.length < 3) return error('Username must be at least 3 characters');
    if (password.length < 4) return error('Password must be at least 4 characters');

    const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existing) return error('Username already taken');

    const id = crypto.randomUUID();
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    await env.DB.prepare(
        'INSERT INTO users (id, username, password_hash, salt, display_name, country, language) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, username, passwordHash, salt, username, 'Global', 'en').run();

    const token = await signJWT({ sub: id, username, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }, env.JWT_SECRET);
    const user = { id, username, displayName: username, avatarUrl: '', isOnboarded: false, xp: 0, level: 1, rank: 'ROOKIE', country: 'Global', language: 'en' };
    return json({ token, user });
}

async function handleLogin(env: Env, request: Request) {
    const { username, password } = await request.json() as any;
    if (!username || !password) return error('Username and password required');

    const record = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first() as any;
    if (!record) return error('User not found');

    const hash = await hashPassword(password, record.salt);
    if (hash !== record.password_hash) return error('Invalid password');

    const token = await signJWT({ sub: record.id, username: record.username, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }, env.JWT_SECRET);
    const user = {
        id: record.id, username: record.username, displayName: record.display_name || record.username,
        avatarUrl: record.avatar_url || '', isOnboarded: !!record.is_onboarded, xp: record.xp || 0,
        level: record.level || 1, rank: record.rank || 'ROOKIE', country: record.country || 'Global', language: record.language || 'en'
    };
    return json({ token, user });
}

async function handleSession(env: Env, jwt: JWTPayload) {
    const record = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(jwt.sub).first() as any;
    if (!record) return error('User not found', 404);
    return json({
        user: {
            id: record.id, username: record.username, displayName: record.display_name || record.username,
            avatarUrl: record.avatar_url || '', isOnboarded: !!record.is_onboarded, xp: record.xp || 0,
            level: record.level || 1, rank: record.rank || 'ROOKIE', country: record.country || 'Global', language: record.language || 'en'
        }
    });
}

async function handleUpdateProfile(env: Env, request: Request, jwt: JWTPayload) {
    const { displayName, avatarUrl, country, language, isOnboarded } = await request.json() as any;
    const sets: string[] = [];
    const vals: any[] = [];

    if (displayName !== undefined) { sets.push('display_name = ?'); vals.push(displayName); }
    if (avatarUrl !== undefined) { sets.push('avatar_url = ?'); vals.push(avatarUrl); }
    if (country !== undefined) { sets.push('country = ?'); vals.push(country); }
    if (language !== undefined) { sets.push('language = ?'); vals.push(language); }
    if (isOnboarded !== undefined) { sets.push('is_onboarded = ?'); vals.push(isOnboarded ? 1 : 0); }

    if (sets.length === 0) return error('No fields to update');

    vals.push(jwt.sub);
    await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();

    // Fetch updated user
    const record = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(jwt.sub).first() as any;
    return json({
        user: {
            id: record.id, username: record.username, displayName: record.display_name,
            avatarUrl: record.avatar_url || '', isOnboarded: !!record.is_onboarded, xp: record.xp,
            level: record.level, rank: record.rank, country: record.country, language: record.language
        }
    });
}

// ─── Posts Handlers ────────────────────────────────────────

async function handleGetPosts(env: Env, url: URL) {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const gameTag = url.searchParams.get('gameTag');

    let query = 'SELECT * FROM posts WHERE is_deleted = 0';
    const params: any[] = [];

    if (gameTag && gameTag !== 'all') {
        query += ' AND game_tag = ?';
        params.push(gameTag);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = await env.DB.prepare(query).bind(...params).all();
    return json({ posts: posts.results || [] });
}

async function handleCreatePost(env: Env, request: Request, jwt: JWTPayload) {
    const { content, gameTag } = await request.json() as any;
    if (!content?.trim()) return error('Content required');

    const user = await env.DB.prepare('SELECT display_name, country, xp, level FROM users WHERE id = ?').bind(jwt.sub).first() as any;
    const id = crypto.randomUUID();

    await env.DB.prepare(
        'INSERT INTO posts (id, content, user_id, username, game_tag, country) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, content, jwt.sub, user.display_name || jwt.username, gameTag || 'Global', user.country || 'Global').run();

    // Add XP
    const newXP = (user.xp || 0) + 25;
    let newLevel = user.level || 1;
    let xpRemaining = newXP;
    while (xpRemaining >= 100) { xpRemaining -= 100; newLevel++; }
    const ranks = ['ROOKIE', 'SOLDIER', 'ELITE', 'COMMANDER', 'LEGEND'];
    const newRank = ranks[Math.min(Math.floor(newLevel / 5), ranks.length - 1)];
    await env.DB.prepare('UPDATE users SET xp = ?, level = ?, rank = ? WHERE id = ?').bind(xpRemaining, newLevel, newRank, jwt.sub).run();

    const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
    return json({ post, xp: xpRemaining, level: newLevel, rank: newRank }, 201);
}

async function handleWowPost(env: Env, postId: string) {
    await env.DB.prepare('UPDATE posts SET wow_count = wow_count + 1 WHERE id = ?').bind(postId).run();
    const post = await env.DB.prepare('SELECT wow_count FROM posts WHERE id = ?').bind(postId).first() as any;
    return json({ wowCount: post?.wow_count || 0 });
}

async function handleGetComments(env: Env, postId: string) {
    const comments = await env.DB.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC').bind(postId).all();
    return json({ comments: comments.results || [] });
}

async function handleAddComment(env: Env, request: Request, jwt: JWTPayload, postId: string) {
    const { content } = await request.json() as any;
    if (!content?.trim()) return error('Content required');

    const user = await env.DB.prepare('SELECT display_name, country FROM users WHERE id = ?').bind(jwt.sub).first() as any;
    const id = crypto.randomUUID();

    await env.DB.prepare(
        'INSERT INTO comments (id, post_id, user_id, username, content, country) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, postId, jwt.sub, user.display_name || jwt.username, content, user.country || 'Global').run();

    const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
    return json({ comment }, 201);
}

// ─── Explore Handler ──────────────────────────────────────

async function handleExplore(env: Env, url: URL) {
    const tab = url.searchParams.get('tab') || 'latest';
    const gameTag = url.searchParams.get('gameTag');
    const limit = parseInt(url.searchParams.get('limit') || '30');

    let query: string;
    const params: any[] = [];

    if (tab === 'popular') {
        query = 'SELECT * FROM posts WHERE is_deleted = 0 ORDER BY wow_count DESC, created_at DESC LIMIT ?';
        params.push(limit);
    } else if (tab === 'game' && gameTag) {
        query = 'SELECT * FROM posts WHERE is_deleted = 0 AND game_tag = ? ORDER BY created_at DESC LIMIT ?';
        params.push(gameTag, limit);
    } else {
        query = 'SELECT * FROM posts WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ?';
        params.push(limit);
    }

    const posts = await env.DB.prepare(query).bind(...params).all();

    // Also get unique game tags for the filter
    const tags = await env.DB.prepare('SELECT DISTINCT game_tag FROM posts WHERE is_deleted = 0 ORDER BY game_tag').all();

    return json({ posts: posts.results || [], gameTags: (tags.results || []).map((t: any) => t.game_tag) });
}

// ─── Communities Handlers ──────────────────────────────────

async function handleGetCommunities(env: Env, jwt: JWTPayload) {
    const communities = await env.DB.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as member_count,
      EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = ?) as is_member
    FROM communities c ORDER BY c.created_at DESC
  `).bind(jwt.sub).all();
    return json({ communities: communities.results || [] });
}

async function handleCreateCommunity(env: Env, request: Request, jwt: JWTPayload) {
    const { name, description } = await request.json() as any;
    if (!name?.trim()) return error('Name required');

    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO communities (id, name, description, owner_id) VALUES (?, ?, ?, ?)').bind(id, name, description || '', jwt.sub).run();
    await env.DB.prepare('INSERT INTO community_members (community_id, user_id) VALUES (?, ?)').bind(id, jwt.sub).run();

    return json({ community: { id, name, description, ownerId: jwt.sub, themeColor: '#a855f7', bannerBase64: null, bgStyle: 'default', member_count: 1, is_member: 1 } }, 201);
}

async function handleJoinCommunity(env: Env, jwt: JWTPayload, communityId: string) {
    try {
        await env.DB.prepare('INSERT INTO community_members (community_id, user_id) VALUES (?, ?)').bind(communityId, jwt.sub).run();
        return json({ success: true });
    } catch {
        return json({ success: true }); // Already a member
    }
}

async function handleKickMember(env: Env, request: Request, jwt: JWTPayload, communityId: string) {
    const community = await env.DB.prepare('SELECT owner_id FROM communities WHERE id = ?').bind(communityId).first() as any;
    if (!community || community.owner_id !== jwt.sub) return error('Not authorized', 403);

    const { userId } = await request.json() as any;
    await env.DB.prepare('DELETE FROM community_members WHERE community_id = ? AND user_id = ?').bind(communityId, userId).run();
    return json({ success: true });
}

async function handleUpdateCommunity(env: Env, request: Request, jwt: JWTPayload, communityId: string) {
    const community = await env.DB.prepare('SELECT owner_id FROM communities WHERE id = ?').bind(communityId).first() as any;
    if (!community || community.owner_id !== jwt.sub) return error('Not authorized', 403);

    const data = await request.json() as any;
    const sets: string[] = [];
    const vals: any[] = [];

    if (data.themeColor !== undefined) { sets.push('theme_color = ?'); vals.push(data.themeColor); }
    if (data.bannerBase64 !== undefined) { sets.push('banner_base64 = ?'); vals.push(data.bannerBase64); }
    if (data.bgStyle !== undefined) { sets.push('bg_style = ?'); vals.push(data.bgStyle); }
    if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
    if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }

    if (sets.length > 0) {
        vals.push(communityId);
        await env.DB.prepare(`UPDATE communities SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
    }

    return json({ success: true });
}

// ─── Groups Handlers ───────────────────────────────────────

async function handleGetGroups(env: Env, jwt: JWTPayload) {
    const groups = await env.DB.prepare(`
    SELECT g.*,
      (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
      EXISTS(SELECT 1 FROM group_members WHERE group_id = g.id AND user_id = ?) as is_member
    FROM groups g ORDER BY g.created_at DESC
  `).bind(jwt.sub).all();
    return json({ groups: groups.results || [] });
}

async function handleCreateGroup(env: Env, request: Request, jwt: JWTPayload) {
    const { name, description, communityId, type } = await request.json() as any;
    if (!name?.trim()) return error('Name required');

    const id = crypto.randomUUID();
    const groupType = type || 'standalone';
    await env.DB.prepare('INSERT INTO groups (id, community_id, name, description, owner_id, type) VALUES (?, ?, ?, ?, ?, ?)').bind(id, communityId || null, name, description || '', jwt.sub, groupType).run();
    await env.DB.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)').bind(id, jwt.sub).run();

    return json({ group: { id, name, description, ownerId: jwt.sub, communityId: communityId || null, type: groupType, member_count: 1, is_member: 1 } }, 201);
}

// ─── Messages Handlers ────────────────────────────────────

async function handleGetMessages(env: Env, url: URL) {
    const targetId = url.searchParams.get('targetId') || 'global';
    const type = url.searchParams.get('type') || 'global';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const after = url.searchParams.get('after'); // For polling: get messages after this timestamp

    let query = 'SELECT * FROM messages WHERE target_id = ? AND type = ?';
    const params: any[] = [targetId, type];

    if (after) {
        query += ' AND created_at > ?';
        params.push(after);
    }

    query += ' ORDER BY created_at ASC LIMIT ?';
    params.push(limit);

    const messages = await env.DB.prepare(query).bind(...params).all();
    return json({ messages: messages.results || [] });
}

async function handleSendMessage(env: Env, request: Request, jwt: JWTPayload) {
    const { content, targetId, type } = await request.json() as any;
    if (!content?.trim()) return error('Content required');

    const user = await env.DB.prepare('SELECT display_name, avatar_url, country FROM users WHERE id = ?').bind(jwt.sub).first() as any;
    const id = crypto.randomUUID();

    await env.DB.prepare(
        'INSERT INTO messages (id, content, user_id, display_name, avatar_url, country, target_id, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, content, jwt.sub, user.display_name || jwt.username, user.avatar_url || '', user.country || 'Global', targetId || 'global', type || 'global').run();

    const msg = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first();
    return json({ message: msg }, 201);
}
