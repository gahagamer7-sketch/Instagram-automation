# AutoChannel

Instagram Reels uchun to'liq avtomatik kanal tizimi. O'zbek auditoriyasiga mo'ljallangan akkauntni bir martalik sozlashdan keyin avtomatik yurgizadi: nisha kashfiyoti, brend, ssenariy, ovoz, video, QA, joylash va tahlil.

To'liq texnik topshiriq: [TZ.md](./TZ.md)

## Arxitektura

- **apps/web** — Next.js 16 admin panel + API (Vercel)
- **packages/db** — Prisma schema (PostgreSQL: Neon/Supabase; lokal dev uchun PGlite)
- **packages/core** — pipeline orchestrator, jobs state machine, QA qoidalari, standart skill
- **packages/ai** — Gemini adapteri (matn/TTS/embedding), skill injection
- **packages/crypto** — AES-256-GCM kalit shifrlash
- **packages/media** — Remotion kompozitsiyalar + FFmpeg skriptlar (reja)
- **packages/integrations** — Instagram Graph, Telegram, Pexels, YouTube, Trends (reja)
- **.github/workflows/worker.yml** — render worker (GitHub Actions)

## Oqim

```
Vercel Cron #1 -> GitHub Actions worker (nisha -> ssenariy -> TTS -> render -> QA -> Blob/R2)
Vercel Cron #2 -> Publisher (Instagram Graph API: container -> status -> publish)
```

## Ishga tushirish (lokal)

Talab: Node.js 20.9+, pnpm 12+.

```bash
pnpm install
cp .env.example .env            # ixtiyoriy: umumiy kalitlar

# 1. Lokal baza (PGlite — PostgreSQL 18, alohida o'rnatish kerak emas)
pnpm db:dev                     # postgresql://postgres:postgres@127.0.0.1:5432

# 2. Boshqa terminalda: sxema va boshlang'ich ma'lumot
pnpm db:deploy                  # migratsiyalarni qo'llash
pnpm db:seed                    # app_settings + faol skill (reels-asosiy)

# 3. Panel
cd apps/web
cp .env.example .env.local      # DATABASE_URL, ENCRYPTION_KEY (majburiy)
pnpm dev                        # http://localhost:3000
```

`ENCRYPTION_KEY` — 32 bayt hex. Yaratish:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Lokal baza PostgreSQL wire-protokolini taqlid qiladi, shuning uchun `DATABASE_URL`
`?pgbouncer=true&connection_limit=1` bilan beriladi. Ishlab chiqarishda
(Neon/Supabase) bu parametrlar kerak emas — kod o'zgarmaydi, faqat URL almashadi.

## Hozirgi holat (To'liq ishlab chiqilgan MVP)

Barcha asosiy bosqichlar to'liq amalga oshirildi:

- **Monorepo & DB**: Prisma sxemasi (12 jadval), AES-256-GCM shifrlash, PGlite dev-baza va seed.
- **AI Adapteri**: Gemini matn, TTS (o'zbekcha tabiiy ovoz), embedding va wav utils.
- **Sozlamalar & API Kalitlar (`/settings`)**: Gemini va YouTube API kalitlari, oxirgi 4 belgi, xarajat limitlari, "Ulanishni tekshirish".
- **Skill Muharriri (`/settings/skill`)**: matn tahriri, `.md` yuklash, versiyalar tarixi va faol versiya boshqaruvi.
- **Nisha Kashfiyotchisi (`/niche`)**: YouTube (UZ) va Gemini signallari, 5 mezonli ballash (talab, raqobat, avtomat., monetiz., zaxira), g'olibni tanlash va kanalga biriktirish.
- **Brend Studiyasi (`/brand`)**: 10 nom varianti, slogan, bio (150 belgigacha), 4 xil 1080x1080 vektorli SVG avatar va 9:16 Reels muqova shabloni, SVG yuklab olish.
- **Kontent Kalendar (`/calendar`)**: 15-30 kunlik rejalashtirish, kunlik jadval (19:00 UTC+5), AI ssenariy generatori.
- **Ssenariy & QA Engine (`@autochannel/core`)**: Hook (0-3s), Shot List, TTS ovozli matn, Captions, Hashtaglar, qat'iy xavfsizlik va Meta qoidalari filtri.
- **Reels Kutubxonasi (`/reels`)**: 9:16 kartalar, ssenariyni ko'rish modali, statuslar bo'yicha filtr.
- **Jonli Pipeline (`/pipeline`)**: 7 bosqichli vizual oqim, fon vazifalari navbati (Jobs queue), qayta urinish va bekor qilish, avto-pauza nazorati.
- **FFmpeg Render Worker (`@autochannel/core`)**: 1080x1920 9:16 H.264/AAC, dinamik ASS subtitrlar, brend suvo'lchami (watermark), LUFS -14 audio normalizatsiyasi, 1s muqova JPEG, Vercel Blob / local saqlash va `.github/workflows/worker.yml`.
- **Meta / Instagram Integratsiyasi (`@autochannel/integrations`)**: Instagram Graph API Reels container yaratish, status polling, media_publish (idempotent, kuniga 25 limit).
- **Telegram Bot Integratsiyasi (`@autochannel/integrations`)**: Video tayyor, joylandi, avto-pauza va tizim xatolari haqida tezkor bildirishnomalar.
- **Onboarding (`/onboarding`)**: 5 bosqichli qadamma-qadam sozlash ustasi (Kalitlar -> Nisha -> Brend -> Instagram -> Avto-rejim).
- **Statistika va Tahlil (`/analytics`)**: 7 kunlik ko'rishlar, reach, saqlashlar grafigi, eng yaxshi Reels reytingi va AI teskari aloqasi (feedback loop).
- **Navbat va Loglar (`/logs`)**: Tizim audit loglari, Jobs navbati, xatoliklar tafsiloti va API xarajatlari nazorati.
- **Admin Xavfsizligi (`/login`, `proxy.ts`)**: Web Crypto HMAC-SHA256 xavfsiz HTTP-only sessiya va `ADMIN_PASSWORD` himoyasi.
- **Cron API**: Vercel Cron #1 (`/api/cron/produce`) va Cron #2 (`/api/cron/publish`) marshrutlari (idempotent, avto-pauza).

## Xavfsizlik

- API kalitlar DB'da AES-256-GCM bilan shifrlanadi, brauzerga faqat oxirgi 4 belgi qaytadi, loglarga yozilmaydi.
- `.env`, `.env.local` va `.dev/` hech qachon repoga tushmaydi.
- Admin panel va API marshrutlari `ADMIN_PASSWORD` + HMAC HTTP-only sessiya orqali himoyalangan (`proxy.ts`).
- Cron marshrutlari `CRON_SECRET` Bearer token bilan himoyalangan.
- Worker kalit shifrini `ENCRYPTION_KEY` (GitHub Actions secret) bilan ochadi.

## Skriptlar

| Buyruq | Vazifa |
|---|---|
| `pnpm dev` | barcha paketlarda dev (turbo) |
| `pnpm db:dev` | lokal PGlite bazasini ishga tushirish |
| `pnpm db:deploy` | migratsiyalarni qo'llash |
| `pnpm db:seed` | boshlang'ich ma'lumot (settings + skill) |
| `pnpm db:generate` | Prisma client generatsiyasi |
| `pnpm db:studio` | Prisma Studio |
| `pnpm typecheck` | barcha paketlarda TypeScript tekshiruvi |
| `pnpm build` | ishlab chiqarish build |
