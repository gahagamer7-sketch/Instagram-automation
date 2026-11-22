# AutoChannel

Instagram Reels uchun to'liq avtomatik kanal tizimi. O'zbek auditoriyasiga mo'ljallangan akkauntni bir martalik sozlashdan keyin avtomatik yurgizadi: nisha kashfiyoti, brend, ssenariy, ovoz, video, QA, joylash va tahlil.

To'liq texnik topshiriq: [TZ.md](./TZ.md)

## Arxitektura

- **apps/web** — Next.js 15 admin panel + API (Vercel)
- **packages/db** — Prisma schema (PostgreSQL: Neon/Supabase)
- **packages/core** — pipeline orchestrator, jobs state machine, QA qoidalari
- **packages/ai** — Gemini adapteri (matn/TTS/rasm), skill injection
- **packages/media** — Remotion kompozitsiyalar + FFmpeg skriptlar
- **packages/integrations** — Instagram Graph, Telegram, Pexels, YouTube, Trends
- **packages/crypto** — AES-256-GCM kalit shifrlash
- **packages/ui** — shadcn/ui + design tokens (ko'k palitra)
- **.github/workflows/worker.yml** — render worker (GitHub Actions)

## Oqim

```
Vercel Cron #1 -> GitHub Actions worker (nisha -> ssenariy -> TTS -> render -> QA -> Blob/R2)
Vercel Cron #2 -> Publisher (Instagram Graph API: container -> status -> publish)
```

## Ishga tushirish (lokal)

```bash
pnpm install
cp .env.example .env   # kalitlarni to'ldiring
pnpm db:migrate
pnpm dev
```

## Xavfsizlik

- API kalitlar DB'da AES-256-GCM bilan shifrlanadi, brauzerga faqat oxirgi 4 belgi qaytadi.
- `.env` hech qachon repoga tushmaydi.
- Worker kalit shifrini `ENCRYPTION_KEY` (GitHub Actions secret) bilan ochadi.
