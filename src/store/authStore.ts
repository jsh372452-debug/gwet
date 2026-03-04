import { create } from 'zustand';
import { api, setToken, clearToken } from '../lib/api';

export interface User {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isOnboarded: boolean;
    xp: number;
    level: number;
    rank: string;
    reputation_tier?: string;
    post_count?: number;
    message_count?: number;
    total_helpful_ai_flags?: number;
    bio?: string;
    game_id?: string;
    game_username?: string;
    whatsapp?: string;
    telegram?: string;
    country?: string;
    language?: 'ar' | 'en';
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (u: string, p: string) => Promise<void>;
    register: (u: string, p: string) => Promise<void>;
    signOut: () => void;
    checkSession: () => Promise<void>;
    updateProfile: (displayName: string, avatarUrl: string, whatsapp?: string, telegram?: string, bio?: string, gameId?: string, gameUsername?: string) => Promise<void>;
    updateIdentity: (country: string, language: 'ar' | 'en') => Promise<void>;
    completeOnboarding: (displayName: string, avatarUrl: string, country: string, language: 'ar' | 'en') => Promise<void>;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,
    error: null,

    setUser: (user) => set({ user }),

    updateProfile: async (displayName, avatarUrl, whatsapp, telegram, bio, gameId, gameUsername) => {
        try {
            const { user } = await api.auth.updateProfile({ displayName, avatarUrl, whatsapp, telegram, bio, gameId, gameUsername });
            set({ user });
        } catch (err) {
            console.error('Update profile failed:', err);
        }
    },

    updateIdentity: async (country, language) => {
        try {
            const { user } = await api.auth.updateProfile({ country, language });
            set({ user });
        } catch (err: any) {
            console.error('Update identity failed:', err);
        }
    },

    completeOnboarding: async (displayName, avatarUrl, country, language) => {
        try {
            const { user } = await api.auth.updateProfile({
                displayName,
                avatarUrl,
                country,
                language,
                isOnboarded: true
            });
            set({ user });
        } catch (err: any) {
            console.error('Complete onboarding failed:', err);
            throw err;
        }
    },

    checkSession: async () => {
        const token = localStorage.getItem('gwet_token');
        if (!token) {
            set({ loading: false });
            return;
        }
        try {
            const { user } = await api.auth.session();
            set({ user, loading: false });
        } catch {
            clearToken();
            set({ user: null, loading: false });
        }
    },

    register: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const { token, user } = await api.auth.register(username, password);
            setToken(token);
            set({ user, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Registration failed', loading: false });
        }
    },

    login: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const { token, user } = await api.auth.login(username, password);
            setToken(token);
            set({ user, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Login failed', loading: false });
        }
    },

    signOut: () => {
        clearToken();
        set({ user: null });
    },
}));
