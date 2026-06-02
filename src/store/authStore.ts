import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api, AAGUser } from '../lib/api';
import { setToken, clearToken } from '../lib/api';
import {
    authCallbackUrl,
    clearAuthParamsFromUrl,
    CUSTOMIZE_PATH,
    FEED_PATH,
    hasPendingAuthCallback,
    navigateTo,
} from '../lib/authRoutes';

interface AuthState {
    user: AAGUser | null;
    loading: boolean;
    error: string | null;
    awaitingConfirmation: boolean;
    pendingEmail: string | null;
    pendingUsername: string | null;
    isVerifySuccess: boolean;
    requiresPasswordSetup: boolean;
    authReady: boolean;
    emailJustVerified: boolean;
    setRequiresPasswordSetup: (val: boolean) => void;
    setVerificationSuccess: (val: boolean) => void;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, username: string) => Promise<void>;
    signOut: () => void;
    checkSession: () => Promise<void>;
    handleEmailCallback: () => Promise<{ isOnboarded: boolean }>;
    routeAfterAuth: (user: AAGUser) => void;
    updateProfile: (data: Partial<{
        displayName: string; avatarUrl: string; bio: string;
        gamingPlatform: string; country: string; language: string;
        isOnboarded: boolean; isVerified: boolean; username: string;
    }>) => Promise<void>;
    verifyCode: (code: string) => Promise<void>;
    resendCode: () => Promise<void>;
    setUser: (user: AAGUser) => void;
}

let authUrlConsumePromise: Promise<boolean> | null = null;

/** Exchange ?code= or read #access_token= from email link (works on / or /auth/callback) */
async function consumeAuthFromUrl(): Promise<boolean> {
    if (authUrlConsumePromise) return authUrlConsumePromise;

    authUrlConsumePromise = (async () => {
        const hash = window.location.hash?.slice(1) || '';
        if (hash.includes('error=')) {
            const params = new URLSearchParams(hash);
            const desc = params.get('error_description') || params.get('error') || 'فشل تفعيل الحساب';
            throw new Error(desc.replace(/\+/g, ' '));
        }

        const query = new URLSearchParams(window.location.search);
        const code = query.get('code');

        if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            clearAuthParamsFromUrl();
            return true;
        }

        const hashParams = new URLSearchParams(hash);
        if (hashParams.has('access_token') || hashParams.get('type') === 'signup') {
            // detectSessionInUrl parses hash on getSession()
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (session) {
                clearAuthParamsFromUrl();
                return true;
            }
        }

        return false;
    })();

    try {
        return await authUrlConsumePromise;
    } finally {
        authUrlConsumePromise = null;
    }
}

async function syncProfileFromSession(accessToken: string, sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<AAGUser> {
    setToken(accessToken);

    try {
        const { user } = await api.auth.session();
        return user;
    } catch {
        const username = (sessionUser.user_metadata?.username as string)
            || sessionUser.email?.split('@')[0]
            || 'Player';
        const { user } = await api.auth.register(
            username,
            sessionUser.email || '',
            sessionUser.id
        );
        return user;
    }
}

function routeAfterAuth(user: AAGUser): void {
    if (!user.isOnboarded) {
        navigateTo(CUSTOMIZE_PATH);
    } else {
        navigateTo(FEED_PATH);
    }
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,
    error: null,
    awaitingConfirmation: false,
    pendingEmail: null,
    pendingUsername: null,
    isVerifySuccess: false,
    requiresPasswordSetup: false,
    authReady: false,
    emailJustVerified: false,

    setRequiresPasswordSetup: (val) => set({ requiresPasswordSetup: val }),
    setVerificationSuccess: (val) => set({ isVerifySuccess: val }),
    setUser: (user) => set({ user }),

    routeAfterAuth,

    updateProfile: async (data) => {
        try {
            const mappedData: Record<string, unknown> = {};
            if (data.displayName !== undefined) mappedData.display_name = data.displayName;
            if (data.avatarUrl !== undefined) mappedData.avatar_url = data.avatarUrl;
            if (data.bio !== undefined) mappedData.bio = data.bio;
            if (data.gamingPlatform !== undefined) mappedData.gaming_platform = data.gamingPlatform;
            if (data.country !== undefined) mappedData.country = data.country;
            if (data.language !== undefined) mappedData.language = data.language;
            if (data.isOnboarded !== undefined) mappedData.is_onboarded = data.isOnboarded;
            if (data.isVerified !== undefined) mappedData.is_verified = data.isVerified;
            if (data.username !== undefined) mappedData.username = data.username;

            const { user: updatedUser } = await api.auth.updateProfile(mappedData);
            set({ user: updatedUser });

            if (data.isOnboarded) {
                routeAfterAuth(updatedUser);
            }
        } catch (err) {
            console.error('Update profile failed:', err);
            throw err;
        }
    },

    verifyCode: async (_code) => {
        set({ loading: true, error: null });
        try {
            const { user } = await api.auth.verify(_code);
            set({ user, loading: false, awaitingConfirmation: false });
            routeAfterAuth(user);
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
                email: pendingEmail,
                options: { emailRedirectTo: authCallbackUrl() },
            });
            if (error) throw error;
        } else {
            await api.auth.resendCode();
        }
    },

    handleEmailCallback: async () => {
        set({ loading: true, error: null, awaitingConfirmation: false, emailJustVerified: false });

        try {
            const fromEmailLink = await consumeAuthFromUrl();

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('لم يتم العثور على جلسة بعد التفعيل. افتح الرابط من نفس المتصفح أو سجّل الدخول.');
            }

            const profileUser = await syncProfileFromSession(session.access_token, session.user);

            set({
                user: profileUser,
                loading: false,
                awaitingConfirmation: false,
                isVerifySuccess: true,
                authReady: true,
                emailJustVerified: fromEmailLink,
                error: null,
            });

            clearAuthParamsFromUrl();
            routeAfterAuth(profileUser);

            return { isOnboarded: !!profileUser.isOnboarded };
        } catch (err: any) {
            set({ loading: false, authReady: true, error: err.message });
            throw err;
        }
    },

    checkSession: async () => {
        const hadAuthParams = hasPendingAuthCallback();
        set({ loading: true, error: null });

        try {
            let fromEmailLink = false;
            if (hadAuthParams) {
                fromEmailLink = await consumeAuthFromUrl();
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                set({ user: null, loading: false, authReady: true, emailJustVerified: false });
                return;
            }

            const syncPromise = syncProfileFromSession(session.access_token, session.user);
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('SYNC_TIMEOUT')), 12000)
            );

            try {
                const user = await Promise.race([syncPromise, timeoutPromise]);
                set({
                    user,
                    loading: false,
                    awaitingConfirmation: false,
                    authReady: true,
                    emailJustVerified: fromEmailLink || hadAuthParams,
                });

                if (fromEmailLink || hadAuthParams) {
                    clearAuthParamsFromUrl();
                    routeAfterAuth(user);
                }
            } catch (syncErr) {
                console.warn('Backend sync failed or timed out:', syncErr);
                const fallbackUser: AAGUser = {
                    id: session.user.id,
                    username: (session.user.user_metadata?.username as string) || session.user.email?.split('@')[0] || 'Player',
                    displayName: (session.user.user_metadata?.display_name as string) || '',
                    avatarUrl: (session.user.user_metadata?.avatar_url as string) || '',
                    influenceScore: 0,
                    isOnboarded: false,
                    isVerified: !!session.user.email_confirmed_at,
                    bio: '',
                    gamingPlatform: '',
                    country: 'Global',
                    language: 'en',
                };
                set({
                    user: fallbackUser,
                    loading: false,
                    authReady: true,
                    emailJustVerified: fromEmailLink || hadAuthParams,
                });
                if (fromEmailLink || hadAuthParams) {
                    clearAuthParamsFromUrl();
                    routeAfterAuth(fallbackUser);
                }
            }
        } catch (err: any) {
            console.error('Session check failed:', err);
            set({
                user: null,
                loading: false,
                authReady: true,
                error: err.message,
                emailJustVerified: false,
            });
        }
    },

    register: async (email, password, username) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                    emailRedirectTo: authCallbackUrl(),
                },
            });

            if (error) throw error;

            if (!data.session) {
                set({
                    loading: false,
                    awaitingConfirmation: true,
                    pendingEmail: email,
                    pendingUsername: username,
                    error: null,
                });
                return;
            }

            setToken(data.session.access_token);
            const { user: profileUser } = await api.auth.register(username, email, data.session.user.id);
            set({ user: profileUser, loading: false, awaitingConfirmation: false });
            routeAfterAuth(profileUser);
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

            const user = await syncProfileFromSession(data.session.access_token, data.user);
            set({ user, loading: false, awaitingConfirmation: false });
            routeAfterAuth(user);
        } catch (err: any) {
            set({ error: err.message || 'Login failed', loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        clearToken();
        set({
            user: null,
            awaitingConfirmation: false,
            pendingEmail: null,
            pendingUsername: null,
            isVerifySuccess: false,
            emailJustVerified: false,
        });
        navigateTo('/');
    },
}));

supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
        clearToken();
        useAuthStore.setState({ user: null });
        return;
    }

    if (!session || event === 'INITIAL_SESSION') return;

    if (event === 'SIGNED_IN' && hasPendingAuthCallback()) {
        return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        try {
            setToken(session.access_token);
            const user = await syncProfileFromSession(session.access_token, session.user);
            useAuthStore.setState({
                user,
                loading: false,
                awaitingConfirmation: false,
                authReady: true,
            });
        } catch {
            /* checkSession handles recovery */
        }
    }
});

export type { AAGUser as User };
