# GWET — Global Web Gaming Network
## Next-Gen Adaptive Activity Graph (AAG)

GWET is a cutting-edge gaming social network built on top of a dynamic activity graph. This project uses **Cloudflare Pages** for hosting and its backend logic (Functions), and **Supabase** for high-performance data storage and authentication.

---

### 🚀 Architecture Overview (Post-Migration)

We have recently migrated the core engine from Cloudflare D1 to **Supabase**.

#### 1. Authentication (Supabase Auth)
- **Email/Password**: Standard secure authentication.
- **Auto-Sync**: Every signed-up user is automatically synced to the `public.profiles` table.
- **Persistence**: Sessions are managed via Supabase's native GoTrue implementation with `onAuthStateChange` listeners for seamless UX.

#### 2. Database (Supabase Postgres)
- **AAG Engine**: The "Adaptive Activity Graph" is now powered by Postgres.
  - `profiles`: User gaming metadata and influence scores.
  - `entities`: Posts, clips, and comments.
  - `edges`: Dynamic interactions (Likes, Shares, Joins, Follows).
  - `communities`: Gaming-specific hubs.

#### 3. Scoring & Intelligence
- **Scoring Algorithm**: Located in `functions/_lib/scoring.ts`, it calculates feed relevance based on freshness, edge weight, and user influence.
- **SpamGuard**: Integrated anti-spam protection that monitors activity rates and entity reputation.

---

### 🛠️ Environment Configuration

To run this project locally or in production, ensure the following variables are set:

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon/Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | (Server-side Only) Admin Key for scoring calculations |
| `LIVEKIT_API_KEY` | API Key for LiveKit integration |
| `LIVEKIT_API_SECRET` | Secret Key for LiveKit integration |

---

### ⚠️ Post-Migration Database Patch

If you are experiencing issues with the onboarding process (page stuck on "Initializing"), you must run the following SQL script in your **Supabase SQL Editor** to ensure your `profiles` table has all the required columns:

```sql
-- Fix profiles table schema for GWET AAG
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gaming_platform TEXT DEFAULT 'PC',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Global',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Ensure display_name exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing records if needed
UPDATE profiles SET display_name = username WHERE display_name IS NULL;
```

---

### 📦 Installation

```bash
npm install
npm run dev
```

### 🚢 Deployment

The project is configured for Cloudflare Pages. Push to `main` to trigger an automatic build. Ensure `Wrangler` is used for environment variable management.

---

**Developed with ❤️ by the GWET Team.**
