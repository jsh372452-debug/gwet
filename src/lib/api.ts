// ═══════════════════════════════════════════════════════════════
// GWET AAG — Frontend API Client
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api';

function getToken(): string | null {
    return localStorage.getItem('gwet_token');
}

export function setToken(token: string) {
    localStorage.setItem('gwet_token', token);
}

export function clearToken() {
    localStorage.removeItem('gwet_token');
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/${path}`, { ...options, headers });

    const contentType = res.headers.get('Content-Type') || '';
    let data: any;

    try {
        if (contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            data = { error: `Unexpected response format: ${contentType}`, details: text.slice(0, 200) };
        }
    } catch (err) {
        data = { error: 'Failed to parse response body' };
    }

    if (!res.ok) {
        const errMsg = data?.error || `Request failed with status ${res.status}`;
        throw new Error(errMsg);
    }

    return data as T;
}

// ─── Types ─────────────────────────────────────────────────

export interface AAGPost {
    id: string;
    type: string;
    ownerId: string;
    content: string;
    mediaUrl: string;
    gameTag: string;
    createdAt: string;
    ownerName: string;
    ownerAvatar: string;
    ownerInfluence: number;
    ownerPlatform: string;
    score: number;
    likeCount: number;
    replyCount: number;
    shareCount: number;
    userLiked: boolean;
}

export interface AAGComment {
    id: string;
    content: string;
    createdAt: string;
    ownerId: string;
    ownerName: string;
    ownerAvatar: string;
    ownerInfluence: number;
}

export interface AAGUser {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    gamingPlatform: string;
    influenceScore: number;
    isOnboarded: boolean;
    country: string;
    language: string;
}

export interface AAGCommunity {
    id: string;
    name: string;
    description: string;
    gameTag: string;
    creatorId: string;
    createdAt?: string;
    memberCount: number;
}

export interface AAGMessage {
    id: string;
    content: string;
    roomId: string;
    createdAt: string;
    ownerId: string;
    ownerName: string;
    ownerAvatar: string;
}

export interface LeaderboardEntry {
    rank: number;
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    gamingPlatform: string;
    influenceScore: number;
}

// ─── API ───────────────────────────────────────────────────

export const api = {
    // ─── Auth ──────────────────────────────────────────────
    auth: {
        register: (username: string, email: string, id: string) =>
            request<{ user: AAGUser }>('auth/register', {
                method: 'POST', body: JSON.stringify({ username, email, id })
            }),

        login: (username: string, password: string) =>
            request<{ token: string; user: AAGUser }>('auth/login', {
                method: 'POST', body: JSON.stringify({ username, password })
            }),

        session: () =>
            request<{ user: AAGUser }>('auth/session'),

        updateProfile: (data: Partial<{
            displayName: string; avatarUrl: string; country: string;
            language: string; isOnboarded: boolean; bio: string;
            gamingPlatform: string;
        }>) =>
            request<{ user: AAGUser }>('auth/profile', {
                method: 'PUT', body: JSON.stringify(data)
            }),

        getUserProfile: (userId: string) =>
            request<{ profile: AAGUser & { postCount: number; followerCount: number; followingCount: number } }>(`users/${userId}`),
    },

    // ─── Feed ──────────────────────────────────────────────
    feed: {
        smart: (params?: { limit?: number; offset?: number }) => {
            const q = new URLSearchParams();
            if (params?.limit) q.set('limit', String(params.limit));
            if (params?.offset) q.set('offset', String(params.offset));
            return request<{ posts: AAGPost[] }>(`feed?${q}`);
        },

        following: (params?: { limit?: number; offset?: number }) => {
            const q = new URLSearchParams();
            if (params?.limit) q.set('limit', String(params.limit));
            if (params?.offset) q.set('offset', String(params.offset));
            return request<{ posts: AAGPost[] }>(`feed/following?${q}`);
        },

        community: (communityId: string, limit?: number) => {
            const q = new URLSearchParams();
            if (limit) q.set('limit', String(limit));
            return request<{ posts: AAGPost[]; community: any }>(`feed/community/${communityId}?${q}`);
        },
    },

    // ─── Posts ─────────────────────────────────────────────
    posts: {
        create: (content: string, gameTag?: string, mediaUrl?: string) =>
            request<{ post: AAGPost }>('posts', {
                method: 'POST', body: JSON.stringify({ content, gameTag, mediaUrl })
            }),

        get: (postId: string) =>
            request<{ post: AAGPost }>(`posts/${postId}`),

        delete: (postId: string) =>
            request<{ success: boolean }>(`posts/${postId}`, { method: 'DELETE' }),

        getComments: (postId: string) =>
            request<{ comments: AAGComment[] }>(`posts/${postId}/comments`),
    },

    // ─── Interactions ──────────────────────────────────────
    interact: {
        like: (entityId: string) =>
            request<{ success: boolean; remaining: number }>(`interact/like/${entityId}`, { method: 'POST' }),

        unlike: (entityId: string) =>
            request<{ success: boolean }>(`interact/unlike/${entityId}`, { method: 'POST' }),

        reply: (entityId: string, content: string) =>
            request<{ comment: AAGComment }>(`interact/reply/${entityId}`, {
                method: 'POST', body: JSON.stringify({ content })
            }),

        share: (entityId: string) =>
            request<{ success: boolean; remaining: number }>(`interact/share/${entityId}`, { method: 'POST' }),

        follow: (userId: string) =>
            request<{ success: boolean; remaining: number }>(`interact/follow/${userId}`, { method: 'POST' }),

        unfollow: (userId: string) =>
            request<{ success: boolean }>(`interact/unfollow/${userId}`, { method: 'POST' }),

        report: (entityId: string, reason?: string) =>
            request<{ success: boolean }>(`interact/report/${entityId}`, {
                method: 'POST', body: JSON.stringify({ reason })
            }),
    },

    // ─── Communities ───────────────────────────────────────
    communities: {
        list: () =>
            request<{ communities: AAGCommunity[] }>('communities'),

        create: (name: string, description: string, gameTag?: string) =>
            request<{ community: AAGCommunity }>('communities', {
                method: 'POST', body: JSON.stringify({ name, description, gameTag })
            }),

        join: (communityId: string) =>
            request<{ success: boolean }>(`communities/${communityId}/join`, { method: 'POST' }),

        leave: (communityId: string) =>
            request<{ success: boolean }>(`communities/${communityId}/leave`, { method: 'POST' }),
    },

    // ─── Leaderboard ───────────────────────────────────────
    leaderboard: {
        get: (limit?: number) => {
            const q = new URLSearchParams();
            if (limit) q.set('limit', String(limit));
            return request<{ leaderboard: LeaderboardEntry[] }>(`leaderboard?${q}`);
        },

        byPlatform: (platform: string) =>
            request<{ leaderboard: LeaderboardEntry[] }>(`leaderboard/platform/${platform}`),
    },

    // ─── Chat ──────────────────────────────────────────────
    chat: {
        send: (content: string, roomId: string) =>
            request<{ message: AAGMessage }>('chat/send', {
                method: 'POST', body: JSON.stringify({ content, roomId })
            }),

        room: (roomId: string, after?: string) => {
            const q = new URLSearchParams();
            if (after) q.set('after', after);
            return request<{ messages: AAGMessage[] }>(`chat/room/${roomId}?${q}`);
        },

        rooms: () =>
            request<{ rooms: Array<{ roomId: string; lastMessageAt: string }> }>('chat/rooms'),
    },
};
