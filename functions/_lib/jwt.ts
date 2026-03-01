// JWT utilities using Web Crypto API (built into Cloudflare Workers)

function base64url(buf: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlEncode(str: string): string {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return atob(str);
}

async function getKey(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
        'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
    );
}

export interface JWTPayload {
    sub: string;
    username: string;
    iat: number;
    exp: number;
}

export async function signJWT(payload: JWTPayload, secret: string): Promise<string> {
    const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64urlEncode(JSON.stringify(payload));
    const key = await getKey(secret);
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));
    return `${header}.${body}.${base64url(sig)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
    try {
        const [header, body, sig] = token.split('.');
        if (!header || !body || !sig) return null;

        const key = await getKey(secret);
        // Reconstruct signature bytes
        const sigStr = base64urlDecode(sig);
        const sigBuf = new Uint8Array(sigStr.length);
        for (let i = 0; i < sigStr.length; i++) sigBuf[i] = sigStr.charCodeAt(i);

        const valid = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(`${header}.${body}`));
        if (!valid) return null;

        const payload: JWTPayload = JSON.parse(base64urlDecode(body));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

        return payload;
    } catch {
        return null;
    }
}

// Password hashing using SHA-256 (same as existing crypto/utils.ts)
export async function hashPassword(password: string, salt: string): Promise<string> {
    const data = new TextEncoder().encode(password + salt);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).join(',');
}

export function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export function error(message: string, status = 400): Response {
    return json({ error: message }, status);
}

// Extract user from JWT in Authorization header
export async function getUserFromRequest(request: Request, secret: string): Promise<JWTPayload | null> {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    return verifyJWT(auth.slice(7), secret);
}
