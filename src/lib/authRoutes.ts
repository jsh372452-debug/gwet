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

export function isAuthCallbackPath(pathname: string): boolean {
    return normalizePath(pathname) === AUTH_CALLBACK_PATH;
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
