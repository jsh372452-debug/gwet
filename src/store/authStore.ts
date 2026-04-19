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
        isOnboarded: boolean; isVerified: boolean;
    }>) => Promise<void>;
    verifyCode: (code: string) => Promise<void>;
    resendCode: () => Promise<void>;
    setUser: (user: AAGUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,

    setUser: (user) => set({ user }),

    updateProfile: async (data) => {
        try {
            // Map camelCase to snake_case for Postgres compatibility
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

    verifyCode: async (code) => {
        set({ loading: true, error: null });
        try {
            const { user } = await api.auth.verify(code);
            set({ user, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Verification failed', loading: false });
            throw err;
        }
    },

    resendCode: async () => {
        try {
            await api.auth.resendCode();
        } catch (err) {
            console.error('Resend failed:', err);
            throw err;
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
            try {
                const { user } = await api.auth.session();
                set({ user, loading: false });
            } catch (syncErr) {
                console.warn('Backend sync failed, but Supabase session is active:', syncErr);
                // We keep the loading false so at least they see the login, 
                // but we don't clear the token yet.
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
            // 1. Supabase Signup
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            });

            if (error) throw error;

            let session = data.session;

            // 2. Auto-login if session didn't start (common with email settings)
            if (!session && data.user) {
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (loginError) throw loginError;
                session = loginData.session;
            }

            if (!session) {
                set({ loading: false, error: 'Account created. Please login manually.' });
                return;
            }

            // 3. Set the token for subsequent API calls
            setToken(session.access_token);

            // 4. Synchronization - Tell the backend to create the profile record
            // We pass the user data explicitly to ensure it works even if session state is slightly lagging
            const { user: profileUser } = await api.auth.register(username, email, session.user.id);
            
            // 5. Success - Set the user and stop loading
            set({ user: profileUser, loading: false });
        } catch (err: any) {
            console.error('Registration/Sync failed:', err);
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
