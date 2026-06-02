import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api, AAGUser } from '../lib/api';
import { clearToken, setToken } from '../lib/api';
import {
    authCallbackUrl,
    clearAuthParamsFromUrl,
    CUSTOMIZE_PATH,
    FEED_PATH,
    hasPendingAuthCallback,
    navigateTo,
} from '../lib/authRoutes';
import { consumeEmailVerificationFromUrl } from '../lib/emailAuth';
import { syncProfileFast } from '../lib/profileSync';

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

function routeAfterAuth(user: AAGUser): void {
    navigateTo(!user.isOnboarded ? CUSTOMIZE_PATH : FEED_PATH);
}

async function finishEmailVerification(set: (p: Partial<AuthState>) => void): Promise<{ isOnboarded: boolean }> {
    await consumeEmailVerificationFromUrl();

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        throw new Error(
            'تم التفعيل لكن الجلسة لم تُحفظ. سجّل دخولك بنفس الإيميل وكلمة المرور — حسابك مفعّل في Supabase.'
        );
    }

    const profileUser = await syncProfileFast(session.access_token, session.user);

    set({
        user: profileUser,
        loading: false,
        awaitingConfirmation: false,
        isVerifySuccess: true,
        authReady: true,
        emailJustVerified: true,
        error: null,
    });

    clearAuthParamsFromUrl();
    routeAfterAuth(profileUser);

    return { isOnboarded: !!profileUser.isOnboarded };
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
        if (data.isOnboarded) routeAfterAuth(updatedUser);
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
        const existing = get().user;
        if (existing && get().emailJustVerified) {
            routeAfterAuth(existing);
            return { isOnboarded: !!existing.isOnboarded };
        }

        try {
            return await finishEmailVerification(set);
        } catch (err: any) {
            set({ authReady: true, error: err.message });
            throw err;
        }
    },

    checkSession: async () => {
        if (hasPendingAuthCallback()) {
            set({ loading: false, authReady: true });
            return;
        }

        set({ loading: true, error: null });

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                set({ user: null, loading: false, authReady: true });
                return;
            }

            const user = await syncProfileFast(session.access_token, session.user);
            set({ user, loading: false, awaitingConfirmation: false, authReady: true });
        } catch (err: any) {
            set({ user: null, loading: false, authReady: true, error: err.message });
        }
    },

    register: async (email, password, username) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username }, emailRedirectTo: authCallbackUrl() },
            });
            if (error) throw error;

            if (!data.session) {
                set({ loading: false, awaitingConfirmation: true, pendingEmail: email, pendingUsername: username });
                return;
            }

            const user = await syncProfileFast(data.session.access_token, data.session.user);
            set({ user, loading: false, awaitingConfirmation: false });
            routeAfterAuth(user);
        } catch (err: any) {
            set({ error: err.message || 'Registration failed', loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            const user = await syncProfileFast(data.session.access_token, data.user);
            set({ user, loading: false, awaitingConfirmation: false });
            routeAfterAuth(user);
        } catch (err: any) {
            set({ error: err.message || 'Login failed', loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        clearToken();
        set({ user: null, awaitingConfirmation: false, pendingEmail: null, pendingUsername: null, isVerifySuccess: false, emailJustVerified: false });
        navigateTo('/');
    },
}));

supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
        clearToken();
        useAuthStore.setState({ user: null });
        return;
    }
    if (!session || event === 'INITIAL_SESSION' || hasPendingAuthCallback()) return;

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
            const user = await syncProfileFast(session.access_token, session.user);
            useAuthStore.setState({ user, loading: false, authReady: true, awaitingConfirmation: false });
        } catch { /* noop */ }
    }
});

export type { AAGUser as User };
