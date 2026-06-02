import { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { clearAuthParamsFromUrl } from './authRoutes';

function readAuthError(): string | null {
    const query = new URLSearchParams(window.location.search);
    const hash = window.location.hash?.slice(1) || '';
    const hashParams = new URLSearchParams(hash);

    const error =
        query.get('error_description') ||
        query.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error');

    if (!error) return null;
    return error.replace(/\+/g, ' ');
}

function mapAuthError(err: { message?: string; code?: string }): Error {
    const msg = (err.message || '').toLowerCase();

    if (msg.includes('code verifier') || msg.includes('both auth code and code verifier')) {
        return new Error(
            'لا يمكن إكمال التفعيل من هذا المتصفح. افتح الرابط من نفس المتصفح الذي أنشأت الحساب منه، أو سجّل دخولك بالإيميل وكلمة المرور (الحساب يكون مفعّلاً في Supabase).'
        );
    }
    if (msg.includes('expired') || msg.includes('invalid') && msg.includes('code')) {
        return new Error('انتهت صلاحية رابط التفعيل. اضغط «إعادة إرسال الرابط» وسجّل من جديد.');
    }
    if (msg.includes('redirect')) {
        return new Error('رابط التوجيه غير مسجّل في Supabase. أضف /auth/callback في Redirect URLs.');
    }

    return new Error(err.message || 'فشل تفعيل الحساب');
}

let consumeLock: Promise<boolean> | null = null;

/**
 * Turn email confirmation URL into a Supabase session.
 * Supports token_hash (any browser), PKCE ?code=, and implicit #access_token=.
 */
export async function consumeEmailVerificationFromUrl(): Promise<boolean> {
    if (consumeLock) return consumeLock;

    consumeLock = (async () => {
        const urlError = readAuthError();
        if (urlError) throw new Error(urlError);

        const query = new URLSearchParams(window.location.search);
        const hash = window.location.hash?.slice(1) || '';
        const hashParams = new URLSearchParams(hash);

        // Already logged in (e.g. React Strict Mode second pass)
        const { data: { session: existing } } = await supabase.auth.getSession();
        if (existing?.user?.email_confirmed_at) {
            if (query.has('code') || query.has('token_hash') || hashParams.has('access_token')) {
                clearAuthParamsFromUrl();
                return true;
            }
        }

        // token_hash — works when opening email in Gmail / phone (no PKCE verifier needed)
        const tokenHash = query.get('token_hash');
        const otpType = (query.get('type') || 'signup') as EmailOtpType;
        if (tokenHash) {
            const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
            if (error) throw mapAuthError(error);
            clearAuthParamsFromUrl();
            return true;
        }

        // PKCE code
        const code = query.get('code');
        if (code) {
            if (existing) {
                clearAuthParamsFromUrl();
                return true;
            }
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw mapAuthError(error);
            clearAuthParamsFromUrl();
            return true;
        }

        // Implicit flow (#access_token=...) — detectSessionInUrl
        if (hashParams.has('access_token') || hashParams.get('type') === 'signup') {
            await new Promise((r) => setTimeout(r, 150));
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw mapAuthError(error);
            if (session) {
                clearAuthParamsFromUrl();
                return true;
            }
            throw new Error('لم نستطع قراءة جلسة التفعيل. جرّب فتح الرابط في Chrome أو سجّل الدخول يدوياً.');
        }

        return false;
    })();

    try {
        return await consumeLock;
    } finally {
        consumeLock = null;
    }
}
