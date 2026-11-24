# AutoChannel — Autonomous AI-Powered Instagram Reels Automation Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444?logo=turborepo)](https://turbo.build/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%206-2D3748?logo=prisma)](https://prisma.io/)
[![Meta Graph API](https://img.shields.io/badge/Meta%20API-v21.0%20Unified%20Login-1877F2?logo=meta)](https://developers.facebook.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Neon-336791?logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**AutoChannel** is an enterprise-grade, end-to-end autonomous SaaS platform designed to produce, render, schedule, and publish high-retention short-form content (**Instagram Reels**) at scale. 

Following an initial one-time onboarding workflow, the system operates fully autonomously: conducting algorithmic niche research, generating consistent brand assets, writing viral scripts, synthesizing natural voiceovers, rendering high-definition 9:16 vertical video with dynamic word-by-word animated subtitles, performing automated quality assurance (QA), and scheduling/publishing directly to Instagram Professional accounts via official Meta APIs.

The platform features an **OpusClip-style Meta Unified Login (Facebook Login for Business)** experience, enabling multi-account management with military-grade AES-256 token encryption.

---

## 🌟 Key Highlights & Features

### 1. OpusClip-Style Meta Unified Login & Multi-Account Management
- **Official Meta OAuth 2.0 Integration**: Built on Meta's latest **Instagram API with Unified Login** architecture utilizing pre-configured `config_id` templates.
- **Guided Onboarding Experience**: Branded connection modal providing clear guidance on switching Personal profiles to Professional (Creator or Business) accounts.
- **Multi-Account Dashboard**: Connect, monitor, reconnect, and disconnect multiple Instagram profiles under a single user workspace.
- **Zero Password Policy**: Never collects or stores Instagram login credentials. Authentication happens entirely on official Meta-hosted consent screens.
- **Secure Token Lifecycle**: Short-lived authorization codes are exchanged server-to-server for 60-day long-lived access tokens, encrypted with AES-256-GCM.

### 2. Algorithmic Niche Discovery (`/niche`)
- Real-time market signal analysis aggregating data from YouTube and search trends.
- Automated 5-factor scoring algorithm evaluating:
  1. Audience Demand
  2. Competitive Density
  3. AI Automation Feasibility
  4. Monetization Potential
  5. Long-term Content Reservoir

### 3. AI Brand Studio (`/brand`)
- Instant brand identity creation: Channel naming suggestions, optimized 150-character bios, and marketing slogans.
- Dynamic SVG Vector Avatar generation (1080x1080) and matching 9:16 Reels cover art templates.

### 4. Viral Scriptwriting & Content Engine (`@autochannel/core`)
- High-retention narrative structure: 0–3 second attention-grabbing Hooks, concise storytelling, Shot Lists, visual cues, captions, and curated hashtag sets.
- Strict compliance filtering against Meta Platform Policies, spam triggers, and community guidelines.

### 5. Automated Video Rendering & Audio Pipeline (FFmpeg / Worker)
- Vertical 1080x1920 (9:16) H.264/AAC video synthesis.
- Dynamic animated ASS subtitles synchronized word-by-word with speech timestamps.
- Audio loudness normalization to standard LUFS -14 with ambient background music ducking.
- Cloud storage integration with Vercel Blob / AWS S3 and background execution via GitHub Actions.

### 6. Interactive Visual Pipeline & Scheduling (`/pipeline`, `/calendar`)
- 7-stage real-time kanban pipeline: *Idea $\rightarrow$ Script $\rightarrow$ Audio $\rightarrow$ Render $\rightarrow$ QA Verification $\rightarrow$ Publish $\rightarrow$ Analytics*.
- Fully automated calendar scheduling with configurable daily publishing cadence (e.g. 19:00 UTC+5 peak engagement window).
- Resilience controls: automatic retries, job queue state machine, and circuit-breaker auto-pause mechanisms.

### 7. Performance Analytics & Audience Insights (`/analytics`)
- Direct integration with Instagram Graph API Insights.
- Real-time tracking of 7-day plays, impressions, reach, profile visits, shares, and saves.
- AI Feedback Loop: automatically analyzes top-performing Reels to iterate and optimize future script hooks.

---

## 🏛 Architecture & Project Structure

AutoChannel is organized as a high-performance **Turborepo** monorepo:

```
├── apps/
│   └── web/                   # Next.js 16 Web Application (App Router, React 19, Tailwind CSS)
│       ├── app/               # Routes: Dashboard, Onboarding, Analytics, Calendar, Pipeline, Settings
│       ├── components/        # UI component library, OpusClip connection modal, Channel cards
│       └── lib/               # Server actions, Meta configuration validator, Session manager
│
├── packages/
│   ├── ai/                    # Google Gemini 2.0 integration (Scriptwriting, TTS voiceover, Embeddings)
│   ├── core/                  # Pipeline state machine, QA validation engine, FFmpeg render worker
│   ├── crypto/                # AES-256-GCM encryption utilities for tokens and API credentials
│   ├── db/                    # Prisma 6 schema and PostgreSQL client (Multi-tenant database models)
│   ├── integrations/          # Meta Graph API v21.0, Telegram notification bot, Pexels media API
│   └── media/                 # Subtitle timing, video layouts, and asset templates
│
├── scripts/
│   └── dev-db.mjs             # In-memory PGlite (PostgreSQL 18 WASM) local development server
└── .github/workflows/         # Continuous integration and distributed render worker pipelines
```

---

## 💻 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Monorepo Manager**: [Turborepo](https://turbo.build/), [pnpm](https://pnpm.io/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) ([Neon Serverless](https://neon.tech/)), [Prisma 6](https://www.prisma.io/)
- **Local Dev Database**: Embedded [PGlite](https://pglite.dev/) (PostgreSQL 18 via WebAssembly)
- **AI Models**: [Google Gemini 2.0 Flash / Pro](https://ai.google.dev/)
- **OAuth & APIs**: Meta Graph API v21.0 (Facebook Login for Business, Instagram Unified Login)
- **Security**: Web Crypto API, AES-256-GCM, HMAC-SHA256, Secure HttpOnly Cookie Sessions

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v20.9.0` or higher (recommended: Node 22+)
- **Package Manager**: `pnpm` (v9 or v12)

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/gahagamer7-sketch/Instagram-automation.git
cd Instagram-automation
pnpm install
```

### 2. Configure Environment Variables

Create `.env` in the root folder or `.env.local` inside `apps/web`:

```env
# Database Connection (Neon PostgreSQL or Local PGlite)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/autochannel?schema=public&pgbouncer=true&connection_limit=1"

# Application Security (Generate a 32-byte hex key)
ENCRYPTION_KEY="your_32_byte_hex_encryption_key_here"
AUTH_SECRET="your_random_session_secret_here"
CRON_SECRET="your_cron_endpoint_bearer_token"
ADMIN_PASSWORD="your_admin_panel_password"

# Meta Developer App (Unified Login / Facebook Login for Business)
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
META_INSTAGRAM_CONFIG_ID="your_facebook_login_for_business_config_id"
META_GRAPH_API_VERSION="v21.0"
META_REDIRECT_URI="https://your-domain.vercel.app/api/auth/instagram/callback"

# AI & Third-Party APIs
GEMINI_API_KEY="your_gemini_api_key"
```

> **Tip**: Generate a secure 32-byte `ENCRYPTION_KEY` using Node.js:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Initialize the Database

The project includes an embedded **PGlite** engine, allowing you to run a full PostgreSQL database locally without installing external database software:

```bash
# Terminal 1: Start the embedded PostgreSQL daemon
pnpm db:dev

# Terminal 2: Push the Prisma schema and seed default settings
pnpm db:deploy
pnpm db:seed
```

### 4. Launch the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Meta Developer App Configuration Guide

To enable official Instagram account linking without encountering redirection issues:

1. Open your app on the [Meta for Developers Dashboard](https://developers.facebook.com/).
2. Navigate to **Use Cases** $\rightarrow$ **Manage messaging & content on Instagram** $\rightarrow$ **Customize**.
3. Under **API setup with Unified Login**, create or select your **Facebook Login for Business** configuration:
   - **Objects**: Select **Instagram Accounts** only (*Do not include Ad Accounts*).
   - **Permissions**: Add standard access for:
     - `instagram_basic`
     - `instagram_content_publish`
     - `instagram_manage_comments`
     - `instagram_manage_messages`
   - **Valid OAuth Redirect URIs**:
     - `https://your-domain.vercel.app/api/auth/instagram/callback`
     - `http://localhost:3000/api/auth/instagram/callback` (for local development)
4. Save the configuration and copy the generated **`config_id`** to `META_INSTAGRAM_CONFIG_ID` in your environment variables.

---

## 📜 Available NPM Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Starts Next.js and all workspace packages in development mode |
| `pnpm build` | Compiles and builds all applications for production |
| `pnpm test` | Runs the full Vitest unit and integration test suite across the monorepo |
| `pnpm typecheck` | Validates TypeScript types across all workspace packages |
| `pnpm db:dev` | Launches the local PGlite PostgreSQL server on port 5432 |
| `pnpm db:deploy` | Applies Prisma migrations/pushes schema to the target database |
| `pnpm db:seed` | Populates initial application settings and system configurations |
| `pnpm db:studio` | Opens Prisma Studio visual database browser |

---

## 🛡 Security & Compliance

- **Meta Graph API Compliance**: All Instagram interactions adhere strictly to Meta's Developer Terms, API rate limits (25 media publishing containers per 24 hours per account), and data protection rules.
- **Cryptographic Isolation**: All stored access tokens are encrypted with authenticated AES-256-GCM. Decryption keys are maintained exclusively on the server side and never exposed in client bundles.
- **CSRF Mitigations**: OAuth 2.0 authorization flows enforce signed, stateful 32-byte cryptographic nonce payloads validated via Secure, SameSite=Lax, HttpOnly cookies.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built for high-volume content creators, digital agencies, and media automation engineers.
