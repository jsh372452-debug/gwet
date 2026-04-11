import { create } from 'zustand';
import { api, AAGUser } from '../lib/api';
import { setToken, clearToken } from '../lib/api';

interface AuthState {
    user: AAGUser | null;
    loading: boolean;
    error: string | null;
    login: (u: string, p: string) => Promise<void>;
    register: (u: string, p: string) => Promise<void>;
    signOut: () => void;
    checkSession: () => Promise<void>;
    updateProfile: (data: Partial<{
        displayName: string; avatarUrl: string; bio: string;
        gamingPlatform: string; country: string; language: string;
        isOnboarded: boolean;
    }>) => Promise<void>;
    setUser: (user: AAGUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,

    setUser: (user) => set({ user }),

    updateProfile: async (data) => {
        try {
            const { user } = await api.auth.updateProfile(data);
            set({ user });
        } catch (err) {
            console.error('Update profile failed:', err);
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

// Re-export User type for components
export type { AAGUser as User };
