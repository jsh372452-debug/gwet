import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api, AAGUser } from '../lib/api';
import { setToken, clearToken } from '../lib/api';

interface AuthState {
    user: AAGUser | null;
    loading: boolean;
    error: string | null;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, username: string) => Promise<void>;
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
            const { user: updatedUser } = await api.auth.updateProfile(data);
            set({ user: updatedUser });
        } catch (err) {
            console.error('Update profile failed:', err);
        }
    },

    checkSession: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                set({ loading: false, user: null });
                return;
            }

            // Set token for API calls
            setToken(session.access_token);

            // Fetch full profile from backend
            const { user } = await api.auth.session();
            set({ user, loading: false });
        } catch (err) {
            console.error('Session check failed:', err);
            clearToken();
            set({ user: null, loading: false });
        }
    },

    register: async (email, password, username) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            });

            if (error) throw error;
            if (!data.session) {
                set({ loading: false, error: 'Check your email for confirmation link' });
                return;
            }

            setToken(data.session.access_token);
            const { user } = await api.auth.session();
            set({ user, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Registration failed', loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            
            setToken(data.session.access_token);
            const { user } = await api.auth.session();
            set({ user, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Login failed', loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        clearToken();
        set({ user: null });
    },
}));

// Re-export User type for components
export type { AAGUser as User };
