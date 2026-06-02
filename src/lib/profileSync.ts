import { api, AAGUser } from './api';
import { setToken } from './api';

const API_SYNC_MS = 4000;

function buildLocalUser(sessionUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
}): AAGUser {
    return {
        id: sessionUser.id,
        username: (sessionUser.user_metadata?.username as string) || sessionUser.email?.split('@')[0] || 'Player',
        displayName: (sessionUser.user_metadata?.display_name as string) || '',
        avatarUrl: (sessionUser.user_metadata?.avatar_url as string) || '',
        influenceScore: 0,
        isOnboarded: false,
        isVerified: true,
        bio: '',
        gamingPlatform: '',
        country: 'Global',
        language: 'en',
    };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('SYNC_TIMEOUT')), ms)),
    ]);
}

/** Fast profile sync — never blocks UX more than a few seconds */
export async function syncProfileFast(
    accessToken: string,
    sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }
): Promise<AAGUser> {
    setToken(accessToken);
    const local = buildLocalUser(sessionUser);

    try {
        const { user } = await withTimeout(api.auth.session(), API_SYNC_MS);
        return user;
    } catch {
        // Background register — don't await (was causing infinite "جاري تجهيز")
        const username = local.username;
        api.auth.register(username, sessionUser.email || '', sessionUser.id).catch(() => {});
        return local;
    }
}
