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

Email templates should use the default confirmation link (PKCE). The app exchanges `?code=` on `/auth/callback`.

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
