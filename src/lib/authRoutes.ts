export const AUTH_CALLBACK_PATH = '/auth/callback';
export const CUSTOMIZE_PATH = '/customize';
export const FEED_PATH = '/feed';

export function authCallbackUrl(): string {
    return `${window.location.origin}${AUTH_CALLBACK_PATH}`;
}

export function normalizePath(pathname: string): string {
    const p = pathname.replace(/\/+$/, '') || '/';
    if (p.toLowerCase() === '/feed') return FEED_PATH;
    return p;
}

/** Supabase email link may land on / or /auth/callback with ?code= or #access_token= */
export function hasPendingAuthCallback(): boolean {
    const query = new URLSearchParams(window.location.search);
    if (query.has('code')) return true;
    if (query.has('token_hash')) return true;
    if (query.get('error') || query.get('error_description')) return true;

    const type = query.get('type');
    if (type === 'signup' || type === 'email' || type === 'magiclink') return true;

    const hash = window.location.hash?.slice(1) || '';
    if (!hash) return false;

    const hashParams = new URLSearchParams(hash);
    if (hash.includes('error=')) return true;
    if (hashParams.has('access_token')) return true;
    if (hashParams.get('type') === 'signup' || hashParams.get('type') === 'magiclink') return true;

    return false;
}

export function isAuthCallbackPath(pathname: string): boolean {
    return normalizePath(pathname) === AUTH_CALLBACK_PATH;
}

export function shouldRunAuthCallback(pathname: string): boolean {
    return isAuthCallbackPath(pathname) || hasPendingAuthCallback();
}

export function isCustomizePath(pathname: string): boolean {
    return normalizePath(pathname) === CUSTOMIZE_PATH;
}

export function isFeedPath(pathname: string): boolean {
    return normalizePath(pathname) === FEED_PATH;
}

export function navigateTo(path: string, replace = true): void {
    const next = normalizePath(path);
    if (normalizePath(window.location.pathname) !== next) {
        window.history[replace ? 'replaceState' : 'pushState']({}, '', next);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}

/** Strip auth tokens from URL after session is established */
export function clearAuthParamsFromUrl(): void {
    const path = normalizePath(window.location.pathname);
    window.history.replaceState({}, '', path);
}
