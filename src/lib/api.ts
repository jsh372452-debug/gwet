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
        throw new Error((data as any).error || `Request failed (${res.status})`);
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

        updateProfile: (data: { displayName?: string; avatarUrl?: string; country?: string; language?: string; isOnboarded?: boolean; whatsapp?: string; telegram?: string; bio?: string; gameId?: string; gameUsername?: string }) =>
            request<{ user: any }>('auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

        getUserProfile: (userId: string) =>
            request<{ profile: any }>(`users/${userId}`),
    },

    // ─── Posts ────────────────────────────────────────────────

    posts: {
        list: (params?: { limit?: number; offset?: number; gameTag?: string; sort?: 'latest' | 'fire' }) => {
            const q = new URLSearchParams();
            if (params?.limit) q.set('limit', String(params.limit));
            if (params?.offset) q.set('offset', String(params.offset));
            if (params?.gameTag) q.set('gameTag', params.gameTag);
            if (params?.sort) q.set('sort', params.sort);
            return request<{ posts: any[] }>(`posts?${q.toString()}`);
        },

        create: (content: string, gameTag?: string, type: string = 'normal', metadata: any = {}) =>
            request<{ post: any; xp: number; level: number; rank: string }>('posts', { method: 'POST', body: JSON.stringify({ content, gameTag, type, metadata }) }),

        fire: (postId: string) =>
            request<{ fireCount: number }>(`posts/${postId}/fire`, { method: 'POST' }),

        joinSession: (postId: string) =>
            request<{ metadata: any }>(`posts/${postId}/join`, { method: 'POST' }),

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

    // ─── Squads ──────────────────────────────────────────────

    squads: {
        list: (category?: string) => request<{ squads: any[] }>(`squads${category ? `?category=${category}` : ''}`),

        create: (name: string, description: string, gameCategory?: string) =>
            request<{ squad: any }>('squads', { method: 'POST', body: JSON.stringify({ name, description, game_category: gameCategory }) }),

        join: (squadId: string) =>
            request('squads/' + squadId + '/join', { method: 'POST' }),

        kick: (squadId: string, userId: string) =>
            request('squads/' + squadId + '/kick', { method: 'POST', body: JSON.stringify({ userId }) }),

        update: (squadId: string, data: any) =>
            request('squads/' + squadId, { method: 'PUT', body: JSON.stringify(data) }),

        aiChat: (squadId: string, message: string) =>
            request<{ response: string }>(`squads/${squadId}/ai/chat`, { method: 'POST', body: JSON.stringify({ message }) }),

        getVoiceToken: (squadId: string) =>
            request<{ token: string }>(`squads/${squadId}/voice/token`, { method: 'POST' }),
    },

    // ─── Groups ───────────────────────────────────────────────

    groups: {
        list: () => request<{ groups: any[] }>('groups'),

        create: (name: string, description: string, squadId?: string, type?: string) =>
            request<{ group: any }>('groups', { method: 'POST', body: JSON.stringify({ name, description, squadId, type: type || 'standalone' }) }),
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

    // ─── Events ──────────────────────────────────────────────

    events: {
        list: (type: string = 'all') => {
            const q = new URLSearchParams();
            if (type !== 'all') q.set('type', type);
            return request<{ events: any[] }>(`events?${q}`);
        },

        create: (data: { title: string; description: string; startTime: string; eventType: string; rules?: string; frameType?: string; maxSlots?: number; prizePool?: string; registrationFee?: string; squadId?: string }) =>
            request<{ event: any }>('events', { method: 'POST', body: JSON.stringify(data) }),

        join: (eventId: string) =>
            request<{ success: true; message: string }>(`events/${eventId}/join`, { method: 'POST' }),
    },
    leaderboard: {
        get: () => request<{ leaderboard: any[] }>('leaderboard')
    },
};
