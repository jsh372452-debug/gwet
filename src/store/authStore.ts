import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api, AAGUser } from '../lib/api';
import { setToken, clearToken } from '../lib/api';

interface AuthState {
    user: AAGUser | null;
    loading: boolean;
    error: string | null;
    awaitingConfirmation: boolean;
    pendingEmail: string | null;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, username: string) => Promise<void>;
    signOut: () => void;
    checkSession: () => Promise<void>;
    updateProfile: (data: Partial<{
        displayName: string; avatarUrl: string; bio: string;
        gamingPlatform: string; country: string; language: string;
        isOnboarded: boolean; isVerified: boolean;
    }>) => Promise<void>;
    verifyCode: (code: string) => Promise<void>;
    resendCode: () => Promise<void>;
    setUser: (user: AAGUser) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,
    error: null,
    awaitingConfirmation: false,
    pendingEmail: null,

    setUser: (user) => set({ user }),

    updateProfile: async (data) => {
        try {
            const mappedData: any = {};
            if (data.displayName !== undefined) mappedData.display_name = data.displayName;
            if (data.avatarUrl !== undefined) mappedData.avatar_url = data.avatarUrl;
            if (data.bio !== undefined) mappedData.bio = data.bio;
            if (data.gamingPlatform !== undefined) mappedData.gaming_platform = data.gamingPlatform;
            if (data.country !== undefined) mappedData.country = data.country;
            if (data.language !== undefined) mappedData.language = data.language;
            if (data.isOnboarded !== undefined) mappedData.is_onboarded = data.isOnboarded;
            if (data.isVerified !== undefined) mappedData.is_verified = data.isVerified;

            const { user: updatedUser } = await api.auth.updateProfile(mappedData);
            set({ user: updatedUser });
        } catch (err) {
            console.error('Update profile failed:', err);
            throw err;
        }
    },

    verifyCode: async (_code) => {
        set({ loading: true, error: null });
        try {
            const { user } = await api.auth.verify(_code);
            set({ user, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Verification failed', loading: false });
            throw err;
        }
    },

    resendCode: async () => {
        const pendingEmail = get().pendingEmail;
        if (pendingEmail) {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: pendingEmail
            });
            if (error) throw error;
        } else {
            try {
                await api.auth.resendCode();
            } catch (err) {
                console.error('Resend failed:', err);
                throw err;
            }
        }
    },

    checkSession: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                set({ loading: false, user: null });
                return;
            }

            setToken(session.access_token);

            try {
                const { user } = await api.auth.session();
                set({ user, loading: false, awaitingConfirmation: false });
            } catch (syncErr) {
                console.warn('Backend sync failed:', syncErr);
                set({ loading: false });
            }
        } catch (err) {
            console.error('Session check failed:', err);
            set({ user: null, loading: false });
        }
    },

    register: async (email, password, username) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username } }
            });

            if (error) throw error;

            // Email confirmation is enabled — no session returned
            if (!data.session) {
                set({ 
                    loading: false, 
                    awaitingConfirmation: true, 
                    pendingEmail: email,
                    error: null 
                });
                return;
            }

            // Email confirmation disabled — proceed normally
            setToken(data.session.access_token);
            const { user: profileUser } = await api.auth.register(username, email, data.session.user.id);
            set({ user: profileUser, loading: false });
        } catch (err: any) {
            console.error('Registration failed:', err);
            set({ error: err.message || 'Registration failed', loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            setToken(data.session.access_token);

            try {
                const { user } = await api.auth.session();
                set({ user, loading: false, awaitingConfirmation: false });
            } catch {
                const { user } = await api.auth.register(
                    data.user.user_metadata?.username || email.split('@')[0],
                    email,
                    data.user.id
                );
                set({ user, loading: false, awaitingConfirmation: false });
            }
        } catch (err: any) {
            set({ error: err.message || 'Login failed', loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        clearToken();
        set({ user: null, awaitingConfirmation: false, pendingEmail: null });
    },
}));

export type { AAGUser as User };
