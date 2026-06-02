# GWET — Authentication Flow

## End-user flow

```text
Sign Up → Email Verification → /auth/callback → /customize → /feed
```

## Supabase Dashboard (required)

Under **Authentication → URL Configuration**, add:

- **Site URL**: `https://your-domain.pages.dev` (or `http://localhost:5173` for dev)
- **Redirect URLs**:
  - `http://localhost:5173/auth/callback`
  - `https://your-domain.pages.dev/auth/callback`

Email templates should use the default confirmation link (PKCE).

The app supports:

- `?token_hash=` (best — works from Gmail / phone mail apps)
- `#access_token=` (implicit flow)
- `?code=` (PKCE — same browser only)

You are then sent to `/customize` automatically.

**If auto-activation fails:** the account may still be verified in Supabase — use **تسجيل الدخول** with email + password.

## Routes

| Path | Purpose |
|------|---------|
| `/auth/callback` | Email activation + session sync |
| `/customize` | Gaming profile setup (first login) |
| `/feed` | Platform home (Dashboard) |

## UX states

- Loading: **جاري تجهيز حسابك...**
- Success: **تم تفعيل الحساب**
- Error: **حدث خطأ، حاول مرة أخرى**
