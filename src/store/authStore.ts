import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api, AAGUser } from '../lib/api';
import { setToken, clearToken } from '../lib/api';

interface AuthState {
    user: AAGUser | null;
    loading: boolean;
    error: string | null;
    pendingEmail: string | null;
    requiresPasswordSetup: boolean;
    setRequiresPasswordSetup: (val: boolean) => void;
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
    pendingEmail: null,
    requiresPasswordSetup: false,
    setRequiresPasswordSetup: (val) => set({ requiresPasswordSetup: val }),

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

            // Network Timeout for backend sync
            const syncPromise = api.auth.session();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('SYNC_TIMEOUT')), 5000)
            );

            try {
                const { user } = await Promise.race([syncPromise, timeoutPromise]) as any;
                set({ user, loading: false });
            } catch (syncErr) {
                console.warn('Backend sync failed or timed out, using local session fallback');
                // Fallback: Create a minimal user object from session metadata if sync fails
                const fallbackUser: AAGUser = {
                    id: session.user.id,
                    username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player',
                    displayName: session.user.user_metadata?.display_name,
                    avatarUrl: session.user.user_metadata?.avatar_url,
                    influenceScore: 0,
                    isOnboarded: true,
                    isVerified: !!session.user.email_confirmed_at,
                    bio: '',
                    gamingPlatform: 'PC',
                    country: 'US',
                    language: 'en'
                };
                set({ user: fallbackUser, loading: false });
            }
        } catch (err) {
            console.error('Session check critical failure:', err);
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

            // Email confirmation is enabled — notify user to disable it
            if (!data.session) {
                alert('عذراً، يجب عليك إيقاف ميزة "Confirm Email" من إعدادات Supabase (Authentication -> Providers -> Email) لتتمكن من الدخول مباشرة بدون رسالة تفعيل.');
                set({ 
                    loading: false, 
                    error: 'Email confirmation is required by Supabase. Please disable it in Supabase dashboard.' 
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
                set({ user, loading: false });
            } catch {
                const { user } = await api.auth.register(
                    data.user.user_metadata?.username || email.split('@')[0],
                    email,
                    data.user.id
                );
                set({ user, loading: false });
            }
        } catch (err: any) {
            set({ error: err.message || 'Login failed', loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        clearToken();
        set({ user: null, pendingEmail: null });
    },
}));

export type { AAGUser as User };
