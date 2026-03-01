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
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data as T;
}

// ─── Auth ──────────────────────────────────────────────────

export const api = {
    auth: {
        register: (username: string, password: string) =>
            request<{ token: string; user: any }>('auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

        login: (username: string, password: string) =>
            request<{ token: string; user: any }>('auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

        session: () => request<{ user: any }>('auth/session'),

        updateProfile: (data: { displayName?: string; avatarUrl?: string; country?: string; language?: string; isOnboarded?: boolean }) =>
            request<{ user: any }>('auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    },

    // ─── Posts ────────────────────────────────────────────────

    posts: {
        list: (params?: { limit?: number; offset?: number; gameTag?: string }) => {
            const q = new URLSearchParams();
            if (params?.limit) q.set('limit', String(params.limit));
            if (params?.offset) q.set('offset', String(params.offset));
            if (params?.gameTag) q.set('gameTag', params.gameTag);
            return request<{ posts: any[] }>(`posts?${q}`);
        },

        create: (content: string, gameTag?: string) =>
            request<{ post: any; xp: number; level: number; rank: string }>('posts', { method: 'POST', body: JSON.stringify({ content, gameTag }) }),

        wow: (postId: string) =>
            request<{ wowCount: number }>(`posts/${postId}/wow`, { method: 'POST' }),

        getComments: (postId: string) =>
            request<{ comments: any[] }>(`posts/${postId}/comments`),

        addComment: (postId: string, content: string) =>
            request<{ comment: any }>(`posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    },

    // ─── Explore ──────────────────────────────────────────────

    explore: {
        get: (tab: 'latest' | 'popular' | 'game' = 'latest', gameTag?: string) => {
            const q = new URLSearchParams({ tab });
            if (gameTag) q.set('gameTag', gameTag);
            return request<{ posts: any[]; gameTags: string[] }>(`explore?${q}`);
        },
    },

    // ─── Communities ──────────────────────────────────────────

    communities: {
        list: () => request<{ communities: any[] }>('communities'),

        create: (name: string, description: string) =>
            request<{ community: any }>('communities', { method: 'POST', body: JSON.stringify({ name, description }) }),

        join: (communityId: string) =>
            request('communities/' + communityId + '/join', { method: 'POST' }),

        kick: (communityId: string, userId: string) =>
            request('communities/' + communityId + '/kick', { method: 'POST', body: JSON.stringify({ userId }) }),

        update: (communityId: string, data: any) =>
            request('communities/' + communityId, { method: 'PUT', body: JSON.stringify(data) }),
    },

    // ─── Groups ───────────────────────────────────────────────

    groups: {
        list: () => request<{ groups: any[] }>('groups'),

        create: (name: string, description: string, communityId?: string, type?: string) =>
            request<{ group: any }>('groups', { method: 'POST', body: JSON.stringify({ name, description, communityId, type: type || 'standalone' }) }),
    },

    // ─── Messages ─────────────────────────────────────────────

    messages: {
        list: (targetId: string, type: string, after?: string) => {
            const q = new URLSearchParams({ targetId, type });
            if (after) q.set('after', after);
            return request<{ messages: any[] }>(`messages?${q}`);
        },

        send: (content: string, targetId: string, type: string) =>
            request<{ message: any }>('messages', { method: 'POST', body: JSON.stringify({ content, targetId, type }) }),
    },
};
