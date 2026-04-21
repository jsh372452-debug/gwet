# GWET — The Ultimate Gaming Social Client 🌪️⚡

**GWET** is a premium, high-performance gaming social network built for elite operatives and clans. This platform has been completely re-built from the ground up to provide a world-class, Discord-style localized experience.

---

## 💎 The Gwet Transformation

We have recently completed a massive re-platforming to move away from legacy architectures into a **State-of-the-Art Gaming Hub**.

### 1. Premium 3-Pane Architecture
The app now utilizes a strict 3-pane UI system for maximum operational efficiency:
- **Server Rail**: Rapid navigation between global hubs and joined clans.
- **Contextual Sidebar**: Channel-style navigation, member lists, and user status controls.
- **Tactical Main Pane**: A centered, high-performance area for broadcasting feeds, chat channels, and leaderboards.

### 2. Ironclad Verification Sync 🛡️
We've implemented a robust cross-tab authorization synchronization system:
- **Real-time Listener**: The waiting tab monitors authentication state changes from Supabase GoTrue instantly.
- **Success Redirection**: Arriving from an email verification link triggers a dedicated "Identity Confirmed" landing page, while simultaneously unlocking all other active sessions.

### 3. Gwet Design System (GDS)
A premium dark-themed visual schema built on tactical precision:
- **Palette**: Deep Navy (`#0B1020`) background with **Electric Blue** (`#3B82F6`) highlights.
- **Typography**: Space Grotesk (Display), Inter (System), and JetBrains Mono (Comms).
- **Aesthetics**: Glassmorphism, radial energy blobs, and high-contrast tactical chips.

---

## 🚀 Architecture Overview

### 📬 Comms & Comms
- **Storm Feed**: Predictive relevance scoring for gaming achievements.
- **Clan Hubs**: Private encrypted communication channels for squads.
- **Reputation (AAG)**: Dynamic influence scoring that ranks operatives based on activity quality and helpfulness.

### ⚙️ Tech Stack
- **Framework**: React + Vite (High-performance FE).
- **Backend**: Cloudflare Pages Functions (Edge Runtime).
- **Database/Auth**: Supabase (Postgres + GoTrue).
- **Design**: Vanilla CSS with GDS Token System.

---

## 🛠️ Environment Configuration

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Key for edge scoring calculations |

---

## 📦 Getting Started

1. **Install Dependencies**: `npm install`
2. **Local Intel**: `npm run dev`
3. **Deployment**: Pushing to the `main` branch triggers a Cloudflare Pages CI/CD pipeline.

---

**FORGED BY THE GWET COMMAND DIVISION.** 🌪️
