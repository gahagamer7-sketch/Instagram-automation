# AutoChannel — AI-Powered Instagram Automation SaaS

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444?logo=turborepo)](https://turbo.build/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://prisma.io/)
[![Meta Graph API](https://img.shields.io/badge/Meta%20API-v21.0%20Unified%20Login-1877F2?logo=meta)](https://developers.facebook.com/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**AutoChannel** — Instagram Reels uchun to'liq avtomatlashtirilgan sun'iy intellekt (AI) SaaS platformasi. Tizim bir martalik sozlashdan so'ng to'liq avtonom ishlaydi: nisha kashfiyoti, brend yaratish, ssenariy yozish, tabiiy ovoz (TTS), video render (FFmpeg/Remotion), sifat nazorati (QA), Meta Graph API orqali Reels joylash va auditoriya tahlili.

Platforma **OpusClip uslubidagi rasmiy Meta Unified Login (Facebook Login for Business)** bilan jihozlangan bo'lib, bir foydalanuvchiga bir nechta Instagram Creator/Business akkauntlarini xavfsiz boshqarish imkonini beradi.

---

## 🚀 Asosiy Imkoniyatlar (Key Features)

- **OpusClip Uslubidagi Meta OAuth 2.0 Integratsiyasi**:
  - Yangi Meta Unified Login (Facebook Login for Business `config_id` bilan) to'liq qo'llab-quvvatlanadi.
  - Standart Instagram Professional (Creator / Business) akkauntlar bilan to'g'ridan-to'g'ri bog'lanish.
  - Multi-account: bitta foydalanuvchi hisobiga bir nechta Instagram kanallarini biriktirish, statuslarni kuzatish va boshqarish.
- **AI Nisha Kashfiyotchisi (`/niche`)**:
  - YouTube (UZ) va Google Trends signallari tahlili.
  - 5 mezonli ballash tizimi (Talab, Raqobat, Avtomatlashtirish, Monetizatsiya, Kontent zaxirasi).
- **Brend Studiyasi (`/brand`)**:
  - AI nom, shior (slogan), bio (150 belgigacha).
  - Vektorli 1080x1080 SVG avatarlar va 9:16 Reels muqovalari generatsiyasi.
- **AI Ssenariy & Sifat Nazorati (`@autochannel/core`)**:
  - Hook (0-3s), Shot List, TTS ovoz matni, Captions va Hashtaglar.
  - Meta platforma xavfsizligi va taqiqlangan so'zlar qat'iy filtri.
- **Avtomatlashtirilgan Video Render (FFmpeg / Worker)**:
  - 1080x1920 (9:16) H.264/AAC, dinamik ASS subtitrlar, brend suvo'lchami (watermark), LUFS -14 audio normalizatsiyasi.
- **Jonli Pipeline & Rejalashtiruvchi (`/pipeline`, `/calendar`)**:
  - 7 bosqichli vizual konveyer (G'oya -> Ssenariy -> Ovoz -> Video -> QA -> Joylash -> Tahlil).
  - Kunlik rejalashtirish (har kuni belgilangan vaqtda avtomatik e'lon qilish).
- **Statistika & Insights (`/analytics`)**:
  - 7 kunlik ko'rishlar, reach, saqlashlar va auditoriya o'sishi tahlili.
- **Korxona Darajasidagi Xavfsizlik**:
  - Barcha API kalitlar va OAuth tokenlar **AES-256-GCM** bilan shifrlanadi.
  - Web Crypto HMAC-SHA256 himoyalangan sessiyalar.

---

## 🏛 Arxitektura (Monorepo)

```
├── apps/
│   └── web/                   # Next.js 16 boshqaruv paneli + API marshrutlari (Tailwind, React 19)
├── packages/
│   ├── ai/                    # Gemini API adapteri (matn, TTS o'zbekcha tabiiy ovoz, embeddings)
│   ├── core/                  # Pipeline orchestrator, Jobs state machine, QA qoidalari
│   ├── crypto/                # AES-256-GCM shifrlash va deshifrlash yordamchilari
│   ├── db/                    # Prisma ORM sxemasi va ma'lumotlar bazasi modellari
│   ├── integrations/          # Meta / Instagram Graph API v21.0, Telegram Bot, Pexels API
│   └── media/                 # Video kompozitsiyalar, subtitr va audio generatorlari
├── scripts/
│   └── dev-db.mjs             # Lokal dasturlash uchun PGlite (PostgreSQL 18) deymoni
└── .github/workflows/         # Render worker va CI/CD oqimlari
```

---

## 🛠 Texnologiyalar

- **Frontend / Backend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Baza**: PostgreSQL (Neon Serverless / Supabase; lokal dev uchun PGlite WASM)
- **ORM**: Prisma 6
- **Sun'iy Intellekt**: Google Gemini 2.0 / 1.5 Flash
- **OAuth & API**: Meta Graph API v21.0 (Instagram Unified Login / Facebook Login for Business)
- **Shifrlash**: Web Crypto API, Node.js Crypto (AES-256-GCM)
- **Monorepo boshqaruvi**: Turborepo, pnpm

---

## ⚡️ O'rnatish va Ishga Tushirish (Quick Start)

### Talablar:
- Node.js 20.9+ yoki 22+
- pnpm 9+ yoki 12+

### 1. Repozitoriyni klonlash va bog'liqliklarni o'rnatish:
```bash
git clone https://github.com/gahagamer7-sketch/Instagram-automation.git
cd Instagram-automation
pnpm install
```

### 2. Muhit o'zgaruvchilarini sozlash (`.env.local`):
Loyihaning ildiz papkasida `.env` yoki `apps/web/.env.local` faylini yarating:

```env
# Ma'lumotlar bazasi (Lokal PGlite yoki Neon PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/autochannel?schema=public&pgbouncer=true&connection_limit=1"

# Xavfsizlik va Shifrlash (32-bayt hex kalit)
ENCRYPTION_KEY="barcha_tokenlarni_shifrlash_uchun_32_bayt_hex_kalit"
AUTH_SECRET="sessiya_imzolash_uchun_tasodifiy_kalit"
CRON_SECRET="cron_vazifalar_uchun_maxfiy_token"
ADMIN_PASSWORD="admin_paroli"

# Meta Developer App (Instagram Unified Login)
META_APP_ID="sizning_meta_app_id"
META_APP_SECRET="sizning_meta_app_secret"
META_INSTAGRAM_CONFIG_ID="sizning_config_id"
META_GRAPH_API_VERSION="v21.0"
META_REDIRECT_URI="https://sizning-domeningiz.vercel.app/api/auth/instagram/callback"

# Sun'iy intellekt
GEMINI_API_KEY="sizning_gemini_api_kalitingiz"
```

> **Maslahat**: `ENCRYPTION_KEY` generatsiya qilish:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. Lokal bazani ishga tushirish (PostgreSQL o'rnatish shart emas):
Loyiha ichiga o'rnatilgan **PGlite** dvigateli ishlatiladi:
```bash
# 1-terminal: Lokal bazani ishga tushirish
pnpm db:dev

# 2-terminal: Sxemani bazaga qo'llash va seed qilish
pnpm db:deploy
pnpm db:seed
```

### 4. Dasturni ishga tushirish:
```bash
pnpm dev
```
Brauzerda oching: [http://localhost:3000](http://localhost:3000)

---

## 🔗 Meta Developer Dashboard Sozlamalari

Instagram akkauntlarni to'g'ri ulash uchun Meta konsolida quyidagilar sozlangan bo'lishi lozim:

1. **Meta App Turi**: Business yoki Consumer ilova.
2. **Use Case**: *Manage messaging & content on Instagram*.
3. **API setup with Unified Login**:
   - Yangi **Facebook Login for Business** konfiguratsiyasi yaratiladi.
   - **Obyektlar**: Faqat **Instagram Accounts** tanlanadi (Ad Accounts qo'shilmaydi).
   - **Ruxsatlar**:
     - `instagram_basic`
     - `instagram_content_publish`
     - `instagram_manage_comments`
     - `instagram_manage_messages`
   - **Valid OAuth Redirect URI**:
     - `https://sizning-saytingiz.vercel.app/api/auth/instagram/callback`
   - Konfiguratsiya saqlanadi va uning **`config_id`** qiymati olinadi.

---

## 📋 Foydali Buyruqlar (Scripts)

| Buyruq | Tavsif |
|---|---|
| `pnpm dev` | Barcha paketlarni development rejimida ishga tushirish |
| `pnpm build` | Production uchun loyihani to'liq build qilish |
| `pnpm test` | Barcha unit va integratsiya testlarini ishga tushirish (Vitest) |
| `pnpm typecheck` | Monorepo bo'yicha TypeScript xatoliklarini tekshirish |
| `pnpm db:dev` | Lokal PGlite PostgreSQL serverini ko'tarish |
| `pnpm db:deploy` | Bazaga migratsiyalarni yuborish |
| `pnpm db:seed` | Baza uchun boshlang'ich sozlamalarni yuklash |

---

## 🔒 Xavfsizlik Kafolatlari

1. **Zero Password Policy**: AutoChannel foydalanuvchining shaxsiy Instagram login va parollarini aslo so'ramaydi va saqlamaydi.
2. **AES-256 Encryption**: Barcha olingan Meta OAuth Access Tokenlar ma'lumotlar bazasida sanoat standarti bo'yicha shifrlangan holatda saqlanadi.
3. **CSRF Protection**: Avtorizatsiya jarayonida 32-baytli kriptografik tasodifiy tokenlar va HttpOnly cookie'lar orqali soxtalashtirish hujumlaridan himoyalangan.

---

## 📄 Litsenziya

Ushbu loyiha [MIT](LICENSE) litsenziyasi asosida tarqatiladi.
