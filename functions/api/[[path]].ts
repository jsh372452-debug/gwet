/// <reference types="@cloudflare/workers-types" />
import { json, error } from '../_lib/jwt';
import { calculateFreshness, calculateEntityScore, calculateInfluenceFromEdges, getEdgeWeight, EDGE_WEIGHTS } from '../_lib/scoring';
import { checkAndIncrementEdgeCount, isSpamEntity } from '../_lib/spam-guard';
import { getSupabaseAdmin, getSupabaseUser, Env } from '../_lib/supabase';

// ═══════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
    const method = request.method;

    // Admin client for core logic
    const sb = getSupabaseAdmin(env);

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
        // ─── Protected Routes (Everything except Debug/Health) ─────────────────
        const sbUser = await getSupabaseUser(request, env);
        if (!sbUser) return error('Unauthorized', 401);

        // Normalize User for our logic
        const user = { 
            id: sbUser.id, 
            username: sbUser.user_metadata?.username || sbUser.email?.split('@')[0] || 'anon',
            email: sbUser.email
        };

        // ─── Route Mapping ───────────────────────────────────

        // Auth syncing/profile
        if (method === 'POST' && path === 'auth/register') return handleRegister(env, sb, user, request);
        if (method === 'POST' && path === 'auth/verify') return handleVerify(env, sb, user, request);
        if (method === 'POST' && path === 'auth/resend-code') return handleResendCode(env, sb, user);
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

        return error('Not found', 404);
    } catch (e: any) {
        console.error('Server error:', e);
        return error(e.message || 'Server error', 500);
    }
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function mapUser(dbUser: any) {
    if (!dbUser) return null;
    return {
        id: dbUser.id,
        username: dbUser.username,
        displayName: dbUser.display_name,
        avatarUrl: dbUser.avatar_url,
        bio: dbUser.bio,
        gamingPlatform: dbUser.gaming_platform,
        influenceScore: dbUser.influence_score || 0,
        language: dbUser.language,
        isVerified: !!dbUser.is_verified
    };
}

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleRegister(env: Env, sb: any, user: { id: string, username: string, email?: string }, request?: Request) {
    // Collect data from body if available (frontend register call)
    let finalUsername = user.username;
    if (request) {
        try {
            const body = await request.json() as any;
            if (body.username) finalUsername = body.username;
        } catch (e) { /* ignore parse error */ }
    }

    const { data: profile, error: err } = await sb.from('profiles').upsert({
        id: user.id,
        username: finalUsername,
        display_name: finalUsername,
        is_verified: false // Will be set to true when Supabase confirms email
    }).select().single();

    if (err) return error(err.message, 400);

    console.log(`[GWET CORE] User registered: ${finalUsername} (${user.id})`);

    return json({ user: mapUser(profile) });
}

async function handleVerify(env: Env, sb: any, user: { id: string }, request: Request) {
    // Check if Supabase has confirmed the user's email
    const supabase = getSupabaseAdmin(env);
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id);
    
    if (!authUser?.email_confirmed_at) {
        return error('EMAIL_NOT_CONFIRMED', 400);
    }
    
    // Email is confirmed — mark user as verified in our profiles table
    const { data: updated, error: verifyErr } = await sb.from('profiles')
        .update({ is_verified: true, verification_code: null })
        .eq('id', user.id)
        .select()
        .single();
        
    if (verifyErr) return error(verifyErr.message, 400);
    
    return json({ user: mapUser(updated) });
}

async function handleResendCode(env: Env, sb: any, user: { id: string, username: string, email?: string }) {
    if (!user.email) return error('No email found', 400);
    
    // Use Supabase to resend the confirmation email
    const supabase = getSupabaseAdmin(env);
    const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
    });
    
    if (resendErr) return error(resendErr.message, 400);
    
    console.log(`[GWET CORE] Resent confirmation email for ${user.email}`);
    return json({ success: true });
}

async function mapPost(sb: any, entity: any, userContextId?: string) {
    const { data: edges } = await sb.from('edges').select('from_user, type, weight, created_at').eq('to_entity', entity.id);
    const { data: profile } = await sb.from('profiles').select('*').eq('id', entity.owner_id).single();

    const metadata = JSON.parse(entity.metadata || '{}');
    const finalScore = calculateEntityScore(edges || [], profile?.influence_score || 0);

    return {
        id: entity.id,
        type: entity.type,
        ownerId: entity.owner_id,
        content: metadata.content || '',
        mediaUrl: metadata.mediaUrl || '',
        gameTag: metadata.gameTag || 'Global',
        createdAt: entity.created_at,
        ownerName: profile?.username || 'Unknown',
        ownerAvatar: profile?.avatar_url || '',
        ownerInfluence: profile?.influence_score || 0,
        ownerPlatform: profile?.gaming_platform || '',
        score: finalScore,
        likeCount: (edges || []).filter((e: any) => e.type === 'like').length,
        replyCount: (edges || []).filter((e: any) => e.type === 'reply').length,
        shareCount: (edges || []).filter((e: any) => e.type === 'share').length,
        userLiked: userContextId ? (edges || []).some((e: any) => e.from_user === userContextId && e.type === 'like') : false
    };
}

async function mapComment(sb: any, entity: any) {
    const { data: profile } = await sb.from('profiles').select('*').eq('id', entity.owner_id).single();
    const metadata = JSON.parse(entity.metadata || '{}');

    return {
        id: entity.id,
        content: metadata.content || '',
        createdAt: entity.created_at,
        ownerId: entity.owner_id,
        ownerName: profile?.username || 'Unknown',
        ownerAvatar: profile?.avatar_url || '',
        ownerInfluence: profile?.influence_score || 0
    };
}

async function handleSession(env: Env, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    const { data: profile, error: err } = await sb.from('profiles').select('*').eq('id', user.id).single();

    if (err || !profile) {
        // Fallback: If session user exists but profile doesn't, create it
        // This can happen if register sync failed
        return handleRegister(env, sb, { id: user.id, username: 'player_' + user.id.slice(0, 5) });
    }
    return json({ user: mapUser(profile) });
}

async function handleUpdateProfile(env: Env, request: Request, user: { id: string }) {
    const data = await request.json() as any;
    const sb = getSupabaseAdmin(env);

    const { data: updated, error: err } = await sb.from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

    if (err) return error(err.message, 400);
    return json({ user: mapUser(updated) });
}

async function handleGetUserProfile(env: Env, userId: string) {
    const sb = getSupabaseAdmin(env);
    const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
    if (!profile) return error('User not found', 404);
    
    // Enrich with counts if needed, but for now just the profile
    return json({ profile: mapUser(profile) });
}

async function handleSmartFeed(env: Env, url: URL, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const { data: entities } = await sb.from('entities')
        .select('*')
        .in('type', ['post', 'clip'])
        .order('created_at', { ascending: false })
        .limit(100);

    if (!entities) return json({ posts: [] });

    const scoredEntities = await Promise.all(entities.map(entity => mapPost(sb, entity, user.id)));

    const finalFeed = scoredEntities
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return json({ posts: finalFeed });
}

async function handleCreatePost(env: Env, request: Request, user: { id: string }) {
    const { content, mediaUrl, gameTag, communityId } = await request.json() as any;
    const sb = getSupabaseAdmin(env);

    const id = crypto.randomUUID();
    const metadata = JSON.stringify({ content, mediaUrl, gameTag, communityId });

    const { data: entity, error: err } = await sb.from('entities').insert({
        id,
        type: 'post',
        owner_id: user.id,
        metadata
    }).select().single();

    if (err) return error(err.message, 400);

    await sb.from('edges').insert({
        id: crypto.randomUUID(),
        from_user: user.id,
        to_entity: id,
        type: 'create',
        weight: EDGE_WEIGHTS.create
    });

    return json({ post: await mapPost(sb, entity, user.id) });
}

async function handleLike(env: Env, entityId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    
    const { data: existing } = await sb.from('edges')
        .select('*')
        .eq('from_user', user.id)
        .eq('to_entity', entityId)
        .eq('type', 'like')
        .maybeSingle();

    if (existing) return error('Already liked');

    const edgeId = crypto.randomUUID();
    const { error: err } = await sb.from('edges').insert({
        id: edgeId,
        from_user: user.id,
        to_entity: entityId,
        type: 'like',
        weight: EDGE_WEIGHTS.like
    });

    if (err) return error(err.message, 400);

    // Recalculate influence
    const { data: entity } = await sb.from('entities').select('owner_id').eq('id', entityId).single();
    if (entity) {
        const { data: allEdges } = await sb.from('edges').select('*').eq('to_entity', entityId);
        const newInfluence = calculateInfluenceFromEdges(allEdges || []);
        await sb.from('profiles').update({ influence_score: newInfluence }).eq('id', entity.owner_id);
    }

    return json({ success: true });
}

async function handleUnlike(env: Env, entityId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    await sb.from('edges').delete().eq('from_user', user.id).eq('to_entity', entityId).eq('type', 'like');
    return json({ success: true });
}

async function handleGetPost(env: Env, postId: string) {
    const sb = getSupabaseAdmin(env);
    const { data: post, error: err } = await sb.from('entities').select('*').eq('id', postId).single();
    if (err || !post) return error('Post not found', 404);
    return json({ post: await mapPost(sb, post) });
}

async function handleDeletePost(env: Env, postId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    const { error: err } = await sb.from('entities').delete().eq('id', postId).eq('owner_id', user.id);
    if (err) return error(err.message, 400);
    return json({ success: true });
}

async function handleGetComments(env: Env, entityId: string) {
    const sb = getSupabaseAdmin(env);
    // Use a simpler approach for comments storage if JSON search is hard
    const { data: comments } = await sb.from('entities')
        .select('*')
        .eq('type', 'comment')
        .filter('metadata', 'ilike', `%${entityId}%`); // Filter by parent ID in JSON string
    
    if (!comments) return json({ comments: [] });
    const mappedComments = await Promise.all(comments.map(c => mapComment(sb, c)));

    return json({ comments: mappedComments });
}

async function handleFollow(env: Env, targetUserId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    const { data: existing } = await sb.from('edges')
        .select('*')
        .eq('from_user', user.id)
        .eq('to_entity', targetUserId)
        .eq('type', 'follow')
        .maybeSingle();

    if (existing) return error('Already following');

    await sb.from('edges').insert({
        id: crypto.randomUUID(),
        from_user: user.id,
        to_entity: targetUserId,
        type: 'follow',
        weight: EDGE_WEIGHTS.follow
    });

    return json({ success: true });
}

async function handleUnfollow(env: Env, targetUserId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    await sb.from('edges').delete().eq('from_user', user.id).eq('to_entity', targetUserId).eq('type', 'follow');
    return json({ success: true });
}

async function handleGetCommunities(env: Env) {
    const sb = getSupabaseAdmin(env);
    const { data: communities } = await sb.from('communities').select('*');
    return json(communities || []);
}

async function handleLeaderboard(env: Env, url: URL) {
    const sb = getSupabaseAdmin(env);
    const { data: users } = await sb.from('profiles')
        .select('id, username, influence_score')
        .order('influence_score', { ascending: false })
        .limit(20);

    return json(users || []);
}

async function handleFollowingFeed(env: Env, url: URL, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    const { data: followings } = await sb.from('edges').select('to_entity').eq('from_user', user.id).eq('type', 'follow');
    if (!followings || followings.length === 0) return json({ posts: [] });

    const followingIds = followings.map(f => f.to_entity);
    const { data: entities } = await sb.from('entities').select('*').in('owner_id', followingIds).order('created_at', { ascending: false }).limit(20);
    if (!entities) return json({ posts: [] });

    const posts = await Promise.all(entities.map(entity => mapPost(sb, entity, user.id)));
    return json({ posts });
}

async function handleCommunityFeed(env: Env, url: URL, communityId: string) {
    const sb = getSupabaseAdmin(env);
    const { data: entities } = await sb.from('entities')
        .select('*')
        .filter('metadata', 'ilike', `%${communityId}%`);
    
    if (!entities) return json({ posts: [] });
    const posts = await Promise.all(entities.map(entity => mapPost(sb, entity)));

    return json({ posts });
}

async function handleReply(env: Env, request: Request, entityId: string, user: { id: string }) {
    const { content } = await request.json() as any;
    const sb = getSupabaseAdmin(env);
    const id = crypto.randomUUID();

    const { data: comment } = await sb.from('entities').insert({
        id,
        type: 'comment',
        owner_id: user.id,
        metadata: JSON.stringify({ content, parent_entity_id: entityId })
    }).select().single();

    await sb.from('edges').insert({
        id: crypto.randomUUID(),
        from_user: user.id,
        to_entity: id,
        type: 'reply',
        weight: EDGE_WEIGHTS.reply
    });

    return json({ comment: await mapComment(sb, comment) });
}

async function handleShare(env: Env, entityId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    await sb.from('edges').insert({
        id: crypto.randomUUID(),
        from_user: user.id,
        to_entity: entityId,
        type: 'share',
        weight: EDGE_WEIGHTS.share
    });
    return json({ success: true });
}

async function handleReport(env: Env, request: Request, entityId: string, user: { id: string }) {
    const { reason } = await request.json() as any;
    const sb = getSupabaseAdmin(env);
    await sb.from('edges').insert({
        id: crypto.randomUUID(),
        from_user: user.id,
        to_entity: entityId,
        type: 'report',
        weight: EDGE_WEIGHTS.report,
        context: JSON.stringify({ reason })
    });
    return json({ success: true });
}

async function handleCreateCommunity(env: Env, request: Request, user: { id: string }) {
    const { name, description, gameTag } = await request.json() as any;
    const sb = getSupabaseAdmin(env);
    const id = crypto.randomUUID();

    const { data: community, error: err } = await sb.from('communities').insert({ id, name, description, game_tag: gameTag, creator_id: user.id }).select().single();
    if (err) return error(err.message, 400);
    return json(community);
}

async function handleJoinCommunity(env: Env, communityId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    await sb.from('edges').insert({
        id: crypto.randomUUID(),
        from_user: user.id,
        to_entity: communityId,
        type: 'join',
        weight: EDGE_WEIGHTS.join
    });
    return json({ success: true });
}

async function handleLeaveCommunity(env: Env, communityId: string, user: { id: string }) {
    const sb = getSupabaseAdmin(env);
    await sb.from('edges').delete().eq('from_user', user.id).eq('to_entity', communityId).eq('type', 'join');
    return json({ success: true });
}
