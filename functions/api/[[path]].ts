/// <reference types="@cloudflare/workers-types" />
import { AccessToken } from 'livekit-server-sdk';
import { signJWT, verifyJWT, hashPassword, generateSalt, json, error, getUserFromRequest, JWTPayload } from '../_lib/jwt';

interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    AI: any;
    LIVEKIT_API_KEY: string;
    LIVEKIT_API_SECRET: string;
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
        const userProfileMatch = path.match(/^users\/([^/]+)$/);
        if (method === 'GET' && userProfileMatch) return handleGetUserProfile(env, userProfileMatch[1]);

        if (method === 'GET' && path === 'posts') return handleGetPosts(env, url);
        if (method === 'POST' && path === 'posts') return handleCreatePost(env, request, user);
        if (method === 'GET' && path === 'explore') return handleExplore(env, url);

        const postFire = path.match(/^posts\/([^/]+)\/fire$/);
        if (method === 'POST' && postFire) return handleFirePost(env, postFire[1]);

        const postJoin = path.match(/^posts\/([^/]+)\/join$/);
        if (method === 'POST' && postJoin) return handleJoinSession(env, postJoin[1], user);

        const postComments = path.match(/^posts\/([^/]+)\/comments$/);
        if (postComments) {
            if (method === 'GET') return handleGetComments(env, postComments[1]);
            if (method === 'POST') return handleAddComment(env, request, user, postComments[1]);
        }

        if (method === 'GET' && path === 'squads') return handleGetSquads(env, user);
        if (method === 'POST' && path === 'squads') return handleCreateSquad(env, request, user);

        const squadJoin = path.match(/^squads\/([^/]+)\/join$/);
        if (method === 'POST' && squadJoin) return handleJoinSquad(env, user, squadJoin[1]);

        const squadKick = path.match(/^squads\/([^/]+)\/kick$/);
        if (method === 'POST' && squadKick) return handleKickMember(env, request, user, squadKick[1]);

        const squadUpdate = path.match(/^squads\/([^/]+)$/);
        if (method === 'PUT' && squadUpdate) return handleUpdateSquad(env, request, user, squadUpdate[1]);

        const squadAiChat = path.match(/^squads\/([^/]+)\/ai\/chat$/);
        if (method === 'POST' && squadAiChat) return handleSquadAiChat(env, request, user, squadAiChat[1]);

        const squadVoice = path.match(/^squads\/([^/]+)\/voice\/token$/);
        if (method === 'POST' && squadVoice) return handleGetVoiceToken(env, user, squadVoice[1]);

        if (method === 'GET' && path === 'groups') return handleGetGroups(env, user);
        if (method === 'POST' && path === 'groups') return handleCreateGroup(env, request, user);

        if (method === 'GET' && path === 'messages') return handleGetMessages(env, url);
        if (method === 'POST' && path === 'messages') return handleSendMessage(env, request, user);

        if (method === 'GET' && path === 'events') return handleGetEvents(env, url);
        if (method === 'POST' && path === 'events') return handleCreateEvent(env, request, user);
        if (method === 'GET' && path === 'leaderboard') return handleGetLeaderboard(env);
        const eventJoin = path.match(/^events\/([^/]+)\/join$/);
        if (method === 'POST' && eventJoin) return handleJoinEvent(env, eventJoin[1], user);

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
    const { displayName, avatarUrl, country, language, isOnboarded, bio, gameId, gameUsername, whatsapp, telegram } = await request.json() as any;
    const sets: string[] = [];
    const vals: any[] = [];

    if (displayName !== undefined) { sets.push('display_name = ?'); vals.push(displayName); }
    if (avatarUrl !== undefined) { sets.push('avatar_url = ?'); vals.push(avatarUrl); }
    if (country !== undefined) { sets.push('country = ?'); vals.push(country); }
    if (language !== undefined) { sets.push('language = ?'); vals.push(language); }
    if (isOnboarded !== undefined) { sets.push('is_onboarded = ?'); vals.push(isOnboarded ? 1 : 0); }
    if (bio !== undefined) { sets.push('bio = ?'); vals.push(bio); }
    if (gameId !== undefined) { sets.push('game_id = ?'); vals.push(gameId); }
    if (gameUsername !== undefined) { sets.push('game_username = ?'); vals.push(gameUsername); }
    if (whatsapp !== undefined) { sets.push('whatsapp = ?'); vals.push(whatsapp); }
    if (telegram !== undefined) { sets.push('telegram = ?'); vals.push(telegram); }

    if (sets.length === 0) return error('No fields to update');

    vals.push(jwt.sub);
    await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();

    // Fetch updated user
    const record = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(jwt.sub).first() as any;
    return json({
        user: {
            id: record.id, username: record.username, displayName: record.display_name,
            avatarUrl: record.avatar_url || '', isOnboarded: !!record.is_onboarded, xp: record.xp,
            level: record.level, rank: record.rank, country: record.country, language: record.language,
            whatsapp: record.whatsapp || '', telegram: record.telegram || ''
        }
    });
}

async function handleGetUserProfile(env: Env, userId: string) {
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first() as any;
    if (!user) return error('User not found');

    // Enhanced Reputation Calculation
    const fireData = await env.DB.prepare('SELECT SUM(fire_count) as total FROM posts WHERE user_id = ?').bind(userId).first() as any;
    const totalFire = fireData?.total || 0;

    // Rep Formula: (Fire * 5) + (XP / 10) + (PostCount * 2) + (MsgCount * 1) + (HelpfulAI * 50)
    const reputation = (totalFire * 5) + ((user.xp || 0) / 10) + ((user.post_count || 0) * 2) + ((user.message_count || 0) * 1) + ((user.total_helpful_ai_flags || 0) * 50);

    let tier = 'BRONZE';
    if (reputation > 5000) tier = 'MYTHIC';
    else if (reputation > 2500) tier = 'LEGEND';
    else if (reputation > 1000) tier = 'DIAMOND';
    else if (reputation > 500) tier = 'PLATINUM';
    else if (reputation > 250) tier = 'GOLD';
    else if (reputation > 100) tier = 'SILVER';

    return json({
        profile: {
            ...user,
            reputation,
            tier
        }
    });
}

// ─── Posts Handlers ────────────────────────────────────────

async function handleGetPosts(env: Env, url: URL) {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const gameTag = url.searchParams.get('gameTag');
    const sort = url.searchParams.get('sort') || 'latest';
    const params: any[] = [];

    let query = '';
    if (sort === 'fire') {
        // Algorithm: Score = (fire_count + 1) / (hours_alive + 2)^1.5
        // Using julianday('now') - julianday(created_at) * 24 for hours_alive
        query = `
            SELECT *, 
            ( (fire_count + 1.0) / ( (julianday('now') - julianday(created_at)) * 24.0 + 2.0 ) ) as score 
            FROM posts 
            WHERE is_deleted = 0
        `;
    } else {
        query = 'SELECT * FROM posts WHERE is_deleted = 0';
    }

    if (gameTag && gameTag !== 'all') {
        query += ' AND game_tag = ?';
        params.push(gameTag);
    }

    if (sort === 'fire') {
        query += ' ORDER BY score DESC, created_at DESC';
    } else {
        query += ' ORDER BY created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = await env.DB.prepare(query).bind(...params).all();
    return json({ posts: posts.results || [] });
}

async function handleCreatePost(env: Env, request: Request, jwt: JWTPayload) {
    const { content, gameTag, type, metadata } = await request.json() as any;
    if (!content?.trim()) return error('Content required');

    const user = await env.DB.prepare('SELECT display_name, country, xp, level FROM users WHERE id = ?').bind(jwt.sub).first() as any;
    const id = crypto.randomUUID();

    const postType = type || 'normal';
    const metadataStr = JSON.stringify(metadata || {});

    await env.DB.prepare(
        'INSERT INTO posts (id, content, user_id, username, game_tag, country, post_type, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, content, jwt.sub, user.display_name || jwt.username, gameTag || 'Global', user.country || 'Global', postType, metadataStr).run();

    await env.DB.prepare('UPDATE users SET post_count = post_count + 1 WHERE id = ?').bind(jwt.sub).run();

    const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first() as any;

    // Reward XP
    const newXp = (user.xp || 0) + 10;
    let newLevel = user.level || 1;
    let xpRemaining = newXp;
    while (xpRemaining >= 100) { xpRemaining -= 100; newLevel++; }
    const ranks = ['ROOKIE', 'SOLDIER', 'ELITE', 'COMMANDER', 'LEGEND'];
    const newRank = ranks[Math.min(Math.floor(newLevel / 5), ranks.length - 1)];
    await env.DB.prepare('UPDATE users SET xp = ?, level = ?, rank = ? WHERE id = ?').bind(xpRemaining, newLevel, newRank, jwt.sub).run();

    return json({ post, xp: xpRemaining, level: newLevel, rank: newRank }, 201);
}

async function handleFirePost(env: Env, postId: string) {
    await env.DB.prepare('UPDATE posts SET fire_count = fire_count + 1 WHERE id = ?').bind(postId).run();
    const post = await env.DB.prepare('SELECT fire_count FROM posts WHERE id = ?').bind(postId).first() as any;
    return json({ fireCount: post?.fire_count || 0 });
}

async function handleJoinSession(env: Env, postId: string, jwt: JWTPayload) {
    const post = await env.DB.prepare('SELECT metadata_json, post_type FROM posts WHERE id = ?').bind(postId).first() as any;
    if (!post || post.post_type !== 'session') return error('Not a session');

    const meta = JSON.parse(post.metadata_json || '{}');
    if (meta.currentSlots >= meta.maxSlots) return error('Session full');

    meta.currentSlots = (meta.currentSlots || 0) + 1;
    await env.DB.prepare('UPDATE posts SET metadata_json = ? WHERE id = ?').bind(JSON.stringify(meta), postId).run();

    return json({ metadata: meta });
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
        query = 'SELECT * FROM posts WHERE is_deleted = 0 ORDER BY fire_count DESC, created_at DESC LIMIT ?';
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

// ─── Squads Handlers ─────────────────────────────────────

async function handleGetSquads(env: Env, jwt: JWTPayload) {
    const squads = await env.DB.prepare(`
    SELECT s.*, 
      (SELECT COUNT(*) FROM squad_members WHERE squad_id = s.id) as member_count,
      EXISTS(SELECT 1 FROM squad_members WHERE squad_id = s.id AND user_id = ?) as is_member
    FROM squads s ORDER BY s.created_at DESC
  `).bind(jwt.sub).all();
    return json({ squads: squads.results || [] });
}

async function handleCreateSquad(env: Env, request: Request, jwt: JWTPayload) {
    const { name, description } = await request.json() as any;
    if (!name?.trim()) return error('Name required');

    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO squads (id, name, description, owner_id) VALUES (?, ?, ?, ?)').bind(id, name, description || '', jwt.sub).run();
    await env.DB.prepare('INSERT INTO squad_members (squad_id, user_id, role) VALUES (?, ?, ?)')
        .bind(id, jwt.sub, 'owner').run();

    return json({ squad: { id, name, description, ownerId: jwt.sub, themeColor: '#a855f7', bannerBase64: null, bgStyle: 'default', member_count: 1, is_member: 1 } }, 201);
}

async function handleJoinSquad(env: Env, jwt: JWTPayload, squadId: string) {
    try {
        await env.DB.prepare('INSERT INTO squad_members (squad_id, user_id) VALUES (?, ?)').bind(squadId, jwt.sub).run();
        return json({ success: true });
    } catch {
        return json({ success: true }); // Already a member
    }
}

async function handleKickMember(env: Env, request: Request, jwt: JWTPayload, squadId: string) {
    const squad = await env.DB.prepare('SELECT owner_id FROM squads WHERE id = ?').bind(squadId).first() as any;
    if (!squad || squad.owner_id !== jwt.sub) return error('Not authorized', 403);

    const { userId } = await request.json() as any;
    await env.DB.prepare('DELETE FROM squad_members WHERE squad_id = ? AND user_id = ?').bind(squadId, userId).run();
    return json({ success: true });
}

async function handleUpdateSquad(env: Env, request: Request, jwt: JWTPayload, squadId: string) {
    const squad = await env.DB.prepare('SELECT owner_id FROM squads WHERE id = ?').bind(squadId).first() as any;
    if (!squad || squad.owner_id !== jwt.sub) return error('Not authorized', 403);

    const data = await request.json() as any;
    const sets: string[] = [];
    const vals: any[] = [];

    if (data.themeColor !== undefined) { sets.push('theme_color = ?'); vals.push(data.themeColor); }
    if (data.bannerBase64 !== undefined) { sets.push('banner_base64 = ?'); vals.push(data.bannerBase64); }
    if (data.bgStyle !== undefined) { sets.push('bg_style = ?'); vals.push(data.bgStyle); }
    if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
    if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }

    if (sets.length > 0) {
        vals.push(squadId);
        await env.DB.prepare(`UPDATE squads SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
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
    const { name, description, squadId, type } = await request.json() as any;
    if (!name?.trim()) return error('Name required');

    const id = crypto.randomUUID();
    const groupType = type || 'standalone';
    await env.DB.prepare('INSERT INTO groups (id, squad_id, name, description, owner_id, type) VALUES (?, ?, ?, ?, ?, ?)').bind(id, squadId || null, name, description || '', jwt.sub, groupType).run();
    await env.DB.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)').bind(id, jwt.sub).run();

    return json({ group: { id, name, description, ownerId: jwt.sub, squadId: squadId || null, type: groupType, member_count: 1, is_member: 1 } }, 201);
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

    // AI Helpfulness Analysis (Background-ish but inline for MVP)
    let isHelpful = 0;
    try {
        if (content.length > 20 && env.AI) {
            const aiRes = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: 'You are a gaming community moderator. Analyze the message and reply with ONLY "HELPFUL" if the user is providing tips, helping others, or being positive. Otherwise reply "NORMAL".' },
                    { role: 'user', content }
                ]
            }) as any;
            if (aiRes.response.includes('HELPFUL')) {
                isHelpful = 1;
                await env.DB.prepare('UPDATE users SET total_helpful_ai_flags = total_helpful_ai_flags + 1 WHERE id = ?').bind(jwt.sub).run();
            }
        }
    } catch (e) {
        console.error('AI Reputation Check Failed:', e);
    }

    await env.DB.prepare(
        'INSERT INTO messages (id, content, user_id, display_name, avatar_url, country, target_id, type, is_helpful) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, content, jwt.sub, user.display_name || jwt.username, user.avatar_url || '', user.country || 'Global', targetId || 'global', type || 'global', isHelpful).run();

    await env.DB.prepare('UPDATE users SET message_count = message_count + 1 WHERE id = ?').bind(jwt.sub).run();

    const msg = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first();
    return json({ message: msg }, 201);
}

async function handleGetLeaderboard(env: Env) {
    const users = await env.DB.prepare(`
        SELECT *, 
        ( (CAST(xp AS FLOAT)/10.0) + (post_count * 2) + (message_count * 1) + (total_helpful_ai_flags * 50) ) as reputation_score 
        FROM users 
        ORDER BY reputation_score DESC 
        LIMIT 10
    `).all();
    return json({ leaderboard: users.results || [] });
}

async function handleSquadAiChat(env: Env, request: Request, jwt: JWTPayload, squadId: string) {
    const { message } = await request.json() as any;
    if (!message) return error('Message required');

    // Fetch Squad Info and AI Config
    const squad = await env.DB.prepare('SELECT name, description FROM squads WHERE id = ?').bind(squadId).first() as any;
    const config = await env.DB.prepare('SELECT personality, rules FROM squad_ai_configs WHERE squad_id = ?').bind(squadId).first() as any;

    if (!squad) return error('Squad not found', 404);

    const systemPrompt = `You are the AI Assistant for the squad "${squad.name}". 
    Squad Description: ${squad.description || 'A group of elite gamers.'}
    Persona: ${config?.personality || 'Helpful, competitive, and gaming-focused.'}
    Rules: ${config?.rules || 'Be respectful but maintain a high-energy gaming vibe.'}
    Keep your responses concise and impactful.`;

    try {
        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ]
        });

        return json({ response: (response as any).response });
    } catch (e: any) {
        return error('AI Service Error: ' + e.message, 500);
    }
}

async function handleGetVoiceToken(env: Env, jwt: JWTPayload, squadId: string) {
    if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
        return error('LiveKit configuration missing', 500);
    }

    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
        identity: jwt.sub,
        name: jwt.username,
    });

    at.addGrant({
        roomJoin: true,
        room: `squad_${squadId}`,
        canPublish: true,
        canSubscribe: true,
    });

    return json({ token: await at.toJwt() });
}

// ─── Events Handlers ──────────────────────────────────────

async function handleGetEvents(env: Env, url: URL) {
    const type = url.searchParams.get('type') || 'all';
    let query = 'SELECT * FROM events WHERE status != ?';
    const params: any[] = ['cancelled'];

    if (type !== 'all') {
        query += ' AND event_type = ?';
        params.push(type);
    }

    query += ' ORDER BY start_time ASC';
    const events = await env.DB.prepare(query).bind(...params).all();
    return json({ events: events.results || [] });
}

async function handleCreateEvent(env: Env, request: Request, jwt: JWTPayload) {
    const { title, description, startTime, eventType, prizePool, registrationFee, squadId, rules, frameType, maxSlots } = await request.json() as any;
    if (!title || !startTime) return error('Title and Start Time required');

    const id = crypto.randomUUID();
    await env.DB.prepare(
        'INSERT INTO events (id, title, description, start_time, event_type, prize_pool, registration_fee, squad_id, creator_id, rules, frame_type, max_slots) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, title, description || '', startTime, eventType || 'tournament', prizePool || '0', registrationFee || 'free', squadId || null, jwt.sub, rules || '', frameType || 'none', maxSlots || 0).run();

    const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();
    return json({ event }, 201);
}

async function handleJoinEvent(env: Env, eventId: string, jwt: JWTPayload) {
    // In a full implementation, we'd have an event_participants table.
    // For now, let's at least check if the event exists.
    const event = await env.DB.prepare('SELECT id FROM events WHERE id = ?').bind(eventId).first();
    if (!event) return error('Event not found', 404);

    // Mocking join success
    return json({ success: true, message: 'Joined successfully' });
}
