# Texnik topshiriq (TZ): Instagram Reels uchun to'liq avtomatik kanal tizimi

**Loyiha nomi:** AutoChannel (ishchi nom)
**Versiya:** 1.2 (deploy, Gemini va dizayn qarorlari kiritilgan)
**Sana:** 2026-yil 22-noyabr

## 1. Loyiha maqsadi

O'zbek auditoriyasiga mo'ljallangan Instagram akkauntni (Reels) to'liq avtomatik yurgizadigan tizim yaratish. Bir martalik sozlashdan keyin tizim o'zi:

- eng viral o'zbek tilidagi nishani o'zi izlab topadi va tanlaydi;
- nom, bio va profil rasmi (avatar) ni o'zi yaratadi;
- har kuni g'oya -> ssenariy -> ovoz -> Reels video -> caption/hashtag tayyorlaydi;
- Reels'ni jadval bo'yicha avtomatik joylaydi;
- natijalarni tahlil qiladi va nisha hamda kontentni o'zi yaxshilaydi.

Biznes maqsad: hozircha bitta Instagram akkauntni arzon va barqaror yurgizish, keyinroq ko'p akkauntga kengayish imkoniyati; daromad manbai: reklama integratsiyalari, affiliate, o'z mahsulot/xizmatlarini targ'ib qilish.

### 1.1. Qabul qilingan qarorlar

| Savol | Qaror |
|---|---|
| Platforma | Instagram (akkaunt mavjud) |
| Nisha va til | AI eng viral nishani o'zi izlab topadi; kontent o'zbek tilida, O'zbekiston auditoriyasi uchun |
| Format | Faqat Reels (9:16) |
| AI | Gemini API (ssenariy, tahlil, rasm) va Gemini TTS (ovoz); foydalanuvchi Sozlamalarda o'z kalitini kiritadi |
| AI "skill" | Tizimga kirganda AI'ga skill (video yaratish yo'riqnomasi) o'rgatiladi; video shu skill bo'yicha yaratiladi (4.13) |
| Yuzli video | AI nishaga qarab o'zi hal qiladi |
| Avtomatlashtirish | To'liq avtomatik, tasdiqsiz; xavfsizlik uchun avtomatik QA, avto-pauza va "To'xtatish" tugmasi |
| Akkauntlar soni | Hozircha bitta |
| Byudjet | Bepul: bepul tariflar va ochiq asboblar |
| Deploy | Vercel (admin panel va API) + GitHub Actions (render worker), 5.1-bo'lim |
| Dizayn | Ustuvor talab: chiroyli interfeys, asosan ko'k va unga mos ranglar (4.12-bo'lim) |

## 2. Muhim cheklovlar (loyiha shu asosda quriladi)

| Bosqich | Holat | Yechim |
|---|---|---|
| Akkaunt ochish | Avtomatlashtirib bo'lmaydi | Akkauntni bir marta qo'lda ochasiz va Business/Creator turiga o'tkazasiz |
| Profil rasmi, nom va bio | Graph API orqali o'zgartirib bo'lmaydi | Tizim nom, bio va avatar'ni tayyorlab beradi; Onboarding ekranida yuklab olib, bir marta qo'yasiz (5 daqiqa) |
| Reels joylash | Graph API orqali mumkin: Business/Creator akkaunt, Facebook Page va Meta App kerak; video video_url (ochiq havola) orqali olinadi | Video imzolangan ochiq URL bilan beriladi; Meta App sozlash qadamlari Onboarding'da |
| Viral nishani aniqlash | Instagram'da trendlar uchun ochiq API yo'q; scraping qoidalarga zid | Google Trends (O'zbekiston), YouTube mostPopular (UZ), Telegram kanallar, o'z statistikasi + LLM tahlili; 14 kunlik sinov (4.0) |
| AI kontent belgisi | Meta realistik AI kontentni belgilashni talab qiladi | Tizim caption'da va (API qo'llab-quvvatlasa) AI belgisi orqali ko'rsatadi |
| To'liq avtomatik rejim xavfi | Takroriy yoki past sifatli kontent reach'ni tushiradi | Kunlik 1-2 Reels, har video noyob, qat'iy avtomatik QA, avto-pauza va "To'xtatish" tugmasi |

Xulosa: tizim "ro'yxatdan o'tish va avatar qo'yish"dan tashqari hamma narsani avtomatlashtiradi (95%); qolgan 5% — bir martalik qo'l sozlash.


## 3. Foydalanuvchilar

- **Egasi (Admin)** — API kalitlarini kiritadi, akkauntni ulaydi, jarayonni kuzatadi, kerak bo'lsa tizimni to'xtatadi.
- **Tizim (Worker)** — navbatdagi vazifalarni avtomatik bajaradi.

## 4. Funksional talablar (modullar)

### 4.0. Nisha kashfiyotchisi (Niche Discovery)
Birinchi ishga tushganda va har 30 kunda ishlaydi.
1. Signal manbalari: Google Trends (UZ, o'zbek/rus so'rovlar), YouTube Data API (mostPopular, regionCode=UZ), Telegram kanallar mavzulari, Instagram Insights. Instagram scraping yo'q.
2. LLM 15-20 ta nomzod nisha taklif qiladi.
3. Ballash (5 mezon): talab, raqobat zichligi, avtomatlashtirish qulayligi, monetizatsiya salohiyati, kontent zaxirasi.
4. Sinov (14 kun): top-3 nisha navbatma-navbat (har biriga 4-5 Reels).
5. Qaror: ko'rishlar, saqlashlar, ulashishlar, o'rtacha ko'rish vaqti bo'yicha g'olib tanlanadi.

### 4.1. Brend generatori (Brand Studio)
- 10 nom varianti, slogan, bio (150 belgigacha), kalit so'zlar.
- Avatar 1080x1080 va Reels muqova shabloni 1080x1920 — Gemini rasm (bepul tarifda bo'lmasa SVG/HTML), 4 variantdan eng yaxshisini AI tanlaydi.
- Onboarding'da tayyor paket: yuklab olish + qo'yish qadamlari.
- Brand Kit: palitra, shrift, logotip, ovoz uslubi, intro/outro — barcha videolarda izchil.

### 4.2. Kontent rejalashtiruvchi (Content Planner)
- 30 kunlik kalendar, haftalik yangilanish; trend tahlili (Trends, YouTube UZ, Telegram).
- G'oyalar bazasi: semantik o'xshashlik tekshiruvi (embeddings).
- Format: faqat Reels 9:16, 15-45 s (eng ko'pi 90 s).

### 4.3. Ssenariy generatori (Script Engine)
- Gemini (faol skill asosida): hook (0-3 s) -> asosiy qism -> CTA.
- Har ssenariy: caption (3 variant), hashtag, ekran matni, shot list, ovozli matn.
- Fakt tekshiruvi (manba talabi) + o'zbek tili editor qadami.

### 4.4. Video ishlab chiqarish (Media Pipeline)
1. TTS: Gemini TTS (bitta doimiy ovoz; talaffuz prototipda sinaladi).
2. Vizual: AI rasm (Gemini), stock (Pexels/Pixabay), HTML/Remotion animatsiya. Yuzli/yuzsiz formatni AI nishaga qarab hal qiladi. Veo kabi pullik video modellari bepul rejimda ishlatilmaydi.
3. Montaj: FFmpeg + Remotion; o'tishlar, royalty-free musiqa, subtitrlar (forced alignment yoki Gemini Transcribe), intro/outro.
4. Eksport: 1080x1920, H.264, AAC, 30 fps, <=90 s.
5. Cover generatsiyasi.


### 4.5. Sifat nazorati (QA & Safety)
- Avto tekshiruvlar: davomiylik, ovoz balandligi (LUFS -14), subtitr sinxroni, qora kadr yo'qligi, matn xatolari.
- Kontent xavfsizligi: zo'ravonlik/nafrat/siyosat filtri; mualliflik huquqi tekshiruvi.
- Rejimlar: **Avto** (standart, tasdiqsiz) va **Yarim avto** (Telegram botga video, admin tasdiqlaydi; standart o'chiq).
- Avto-pauza: ketma-ket 2 joylash xatosi yoki QA'dan o'tmagan 3 video -> pauza + Telegram xabar. "To'xtatish" tugmasi butun tizimni darhol to'xtatadi.

### 4.6. Joylash va jadval (Scheduler & Publisher)
- Boshlang'ich jadval: O'zbekiston vaqti (UTC+5) kechqurun; keyin statistikadan o'rganiladi (Hobby cron +/-1 soat).
- Instagram Graph API: POST /{ig-user-id}/media (media_type=REELS, video_url, caption) -> container; status_code FINISHED bo'lguncha kutish; POST /{ig-user-id}/media_publish. video_url — R2/Blob'dagi imzolangan ochiq havola.
- Caption, 5-10 hashtag, AI belgisi. Kunlik 1-3 Reels limitga to'sqinlik qilmaydi.
- Retry: eksponensial backoff, 5 marta; muvaffaqiyatsiz bo'lsa admin'ga ogohlantirish. Idempotentlik majburiy.

### 4.7. Tahlil va o'rganish (Analytics & Feedback Loop)
- Instagram Insights: plays, reach, saves, shares, o'rtacha ko'rish vaqti, obunachilar o'sishi.
- Haftalik hisobot (Telegram/admin panel): eng yaxshi/yomon videolar, tavsiyalar.
- Teskari aloqa: yaxshi mavzu/hook/uzunlik ustuvor; har 30 kunda nisha qayta baholanadi.

### 4.8. Admin panel
- Akkaunt holati va ulash (Meta OAuth, token muddati).
- Brand Studio, kontent kalendari (drag-and-drop), ssenariy tahriri.
- Jobs navbati monitoringi, loglar, xatolar.
- Xarajat hisobi (har video uchun AI/TTS/render narxi). Rol: Admin.

### 4.9. Bildirishnomalar
Telegram bot: yangi video tayyor, joylandi, avto-pauza, xato, haftalik hisobot, token muddati tugayapti.

### 4.10. Sozlamalar va API kalitlar
- Sozlamalar -> AI kalitlar: Gemini (matn, rasm, TTS) va Meta uchun alohida maydonlar.
- Har kalit: provayder tanlash, kiritish, "Ulanishni tekshirish" (test so'rov), holat belgisi (ulangan/xato/kvota tugayapti).
- Kalitlar serverda AES-256-GCM bilan shifrlanadi, brauzerga qaytarilmaydi (faqat oxirgi 4 belgi), loglarga yozilmaydi.
- Har provayder uchun kunlik/oylik xarajat limiti. Provayderni adapter orqali almashtirish (kodsiz).
- Kalit yo'q bo'lsa faqat tegishli bosqich "kalit kerak" holatida to'xtaydi.

### 4.11. Onboarding (birinchi ishga tushirish)
1. API kalitlarni kiritish va tekshirish.
2. Nisha kashfiyotchisi ishga tushadi (jonli progress).
3. Brend paketi: nom, bio, avatar — yuklab olib akkauntga qo'yish.
4. Instagram Business akkauntni ulash (Meta OAuth, qadamma-qadam).
5. "Avtomatik rejimni yoqish" tugmasi.


### 4.12. Dizayn va interfeys (UI/UX) — ustuvor talab
- Uslub: zamonaviy toza dashboard; karta layout, yumshoq soyalar, 16px radius, ko'p bo'sh joy. Ranglar asosan ko'k; gradient ko'k->indigo->havorang (faqat tugma/grafik/belgilar, fonda emas).
- Tema: Dark (asosiy) va Light, tizim sozlamasiga qarab avtomatik; ranglar CSS o'zgaruvchilarida (design tokens).
- Tipografiya: Inter yoki Manrope; raqamlarda tabular-nums.
- Texnologiya: shadcn/ui + Tailwind, Lucide, Recharts, Framer Motion.
- Til: to'liq o'zbekcha (lotin). Mobil: to'liq moslashgan (pastki navigatsiya).
- Mikro-tajriba: bo'sh holat illustratsiyalari, toast, yuqori panelda tizim holati indikatori va qizil "To'xtatish" tugmasi.
- Kontrast WCAG AA, aniq fokus holatlari.

Rang tokenlari (ko'k palitra, boshlang'ich taklif):

| Token | Dark | Light | Qayerda |
|---|---|---|---|
| background | #0B1220 | #F5F8FF | sahifa foni |
| surface | #111B2E | #FFFFFF | kartalar |
| primary | #3B82F6 | #2563EB | asosiy tugma, havola |
| primary-strong | #1D4ED8 | #1E40AF | hover/pressed |
| accent-indigo | #6366F1 | #4F46E5 | gradient, grafik |
| accent-cyan | #22D3EE | #0891B2 | ikkinchi aksent |
| text | #E6EDF7 | #0F172A | asosiy matn |
| muted | #8EA0BF | #5B6B87 | ikkinchi darajali matn |
| success/warning/danger | #22C55E/#F59E0B/#EF4444 | #16A34A/#D97706/#DC2626 | holat belgilari |

Sahifalar: Bosh sahifa (holat, keyingi Reels taymeri, 7 kunlik grafik, obunachilar, eng yaxshi Reels, bugungi xarajat); Jonli pipeline (animatsiyali progress); Reels kutubxonasi (grid, 9:16 maket); Kontent kalendari (oy, drag-and-drop); Nisha tahlili; Brend studiyasi; Statistika; Navbat va loglar; Sozlamalar.

### 4.13. AI "skill" tizimi
- Skill — video yaratish yo'riqnomasi; har bosqichda Gemini'ga system instruction sifatida beriladi.
- Tarkibi: uslub/ohang, Reels tuzilmasi (hook 0-3 s -> asosiy -> CTA), vizual qoidalar (ko'k palitra, subtitr uslubi, kadr tezligi), taqiqlar (siyosat, haqorat, mualliflik, noto'g'ri fakt), 3-5 namunaviy ssenariy.
- Skill muharriri (Sozlamalar -> Skill): matn muharriri, .md yuklash, versiyalar tarixi, faol versiya, "Sinab ko'rish" tugmasi.
- Chegara: tizim qoidalari (QA, taqiqlar filtri, joylash limiti) skill'dan ustun.
- Saqlash: skills jadvali (nom, matn, versiya, faol).

## 5. Tizim arxitekturasi

```
[Admin Panel (Next.js)] --> [API (Vercel route handlers)]
         VERCEL                    |
                    [PostgreSQL (Neon/Supabase) + Prisma]
                                   |
        +--------------------------+-------------------------+
[Vercel Cron #1: ishlab chiqarish]              [Vercel Cron #2: joylash]
        |                                                  |
 workflow_dispatch                        [Publisher -> Instagram Graph API]
        v
[GitHub Actions worker]
 Niche -> Script (Gemini + skill) -> Gemini TTS -> Render (FFmpeg/Remotion) -> QA
        |
[Vercel Blob / R2 -> ochiq URL]
```

Stack: Next.js 15, React, Tailwind, shadcn/ui, Auth.js v5, Framer Motion, Recharts, Lucide; Next.js API (Vercel) + GitHub Actions render worker; PostgreSQL (Neon/Supabase) + Prisma; jobs jadvali + Vercel Cron + GitHub Actions (Redis/BullMQ yo'q); FFmpeg/Remotion; Vercel Blob yoki Cloudflare R2; Telegram Bot API (grammY/Telegraf).

### 5.1. Vercel deploy va bepul render
| Qism | Qayerda | Vazifasi |
|---|---|---|
| Admin panel, API, Onboarding, Skill muharriri | Vercel (Next.js 15) | interfeys, sozlamalar, jobs yaratish |
| Kunlik ishlab chiqarish | Vercel Cron #1 | job yaratadi, GitHub Actions'ni ishga tushiradi |
| Og'ir ish (render) | GitHub Actions | FFmpeg/Remotion render, Blob/R2'ga yuklash, DB'ga holat |
| Joylash | Vercel Cron #2 | container -> status -> media_publish (idempotent) |
| DB | Neon/Supabase | bepul tarif |
| Media | Vercel Blob / Cloudflare R2 | ochiq URL |

Cheklovlar (2026-11-22 holatiga tekshiriladi):
- Vercel Hobby faqat nokommersial; daromad boshlansa Pro yoki boshqa hosting.
- Hobby cron kuniga 1 marta, +/-1 soat aniqlik (kunlik 1 Reels uchun yetarli).
- GitHub Actions bepul daqiqalari cheklangan (private ~2000 daq/oy; public cheklovsiz). 1 Reels ~10-15 daqiqa.
- Gemini bepul tarif limitlari past; TTS/rasm bepul tarifda mavjudligi prototipda tekshiriladi.
- Gemini TTS o'zbek tilini ("Northern Uzbek") qo'llab-quvvatlaydi; talaffuz eshitib baholanadi.


## 6. Ma'lumotlar bazasi (asosiy jadvallar)

- **channels** — id, platform (instagram), nom, handle, niche, til, holat, brand_kit_id
- **oauth_tokens** — channel_id, access/refresh token (shifrlangan), expires_at, scopes
- **api_credentials** — provider, shifrlangan kalit, oxirgi_4_belgi, holat, oylik_limit
- **skills** — nom, matn, versiya, faol
- **app_settings** — avto_rejim, joylash_soatlari, pauza_holati
- **niche_candidates** — nisha, signal_manbalari (JSON), ballar, holat (sinovda/g'olib/rad), baholangan_sana
- **brand_kits** — ranglar, shrift, avatar_url, ovoz_id, intro/outro
- **content_ideas** — channel_id, mavzu, embedding, holat, manba
- **videos** — channel_id, idea_id, skill_id, holat (idea->script->voice->render->qa->ready->published->failed), caption, hashtaglar, fayl_url, published_at, ig_container_id, ig_media_id
- **scripts** — video_id, matn, shot_list (JSON), versiya
- **jobs** — tur, payload, urinishlar, xato, vaqtlar
- **analytics_snapshots** — video_id, sana, plays, reach, saves, shares, avg_watch_time
- **cost_logs** — video_id, provayder, miqdor (token/so'rov), limit_holati
- **audit_logs** — kim/nima/qachon

## 7. Kunlik avtomatik oqim (pipeline)

1. Vercel Cron GitHub Actions worker'ini ishga tushiradi; Planner keyingi mavzuni oladi/yaratadi.
2. Script Engine ssenariy yozadi -> editor qadami (til, fakt).
3. Gemini TTS ovoz -> subtitr vaqt belgilari.
4. Vizual materiallar -> montaj -> eksport.
5. Avtomatik QA (o'tmasa qayta generatsiya; 2 urinishdan keyin tashlab yuboriladi + ogohlantirish).
6. Video "ready" -> joylash soatini kutadi.
7. Vercel Cron #2 Publisher'ni ishga tushiradi -> Reels joylanadi -> natija saqlanadi.
8. 24 va 72 soatdan keyin statistika -> o'rganish sikli.

## 8. Nofunksional talablar

- Ishonchlilik: har bosqich resumable; bitta xato butun sistemani to'xtatmaydi.
- Unumdorlik: bitta Reels <= 15 daqiqa.
- Xavfsizlik: tokenlar AES-256-GCM, .env repoga tushmaydi, 2FA, rate-limit, audit log.
- Kengayuvchanlik: kanallar oshganda worker'lar gorizontal ko'payadi.
- Kuzatuv: pino loglar, Sentry, uptime tekshiruvi.
- Zaxira: DB kunlik backup, media 30 kun.
- Xarajat nazorati: bepul tarif limitlariga rioya; oshsa kutish/to'xtatish + ogohlantirish.

## 9. Tashqi integratsiyalar

| Xizmat | Maqsad |
|---|---|
| Google Trends / YouTube Data API v3 (mostPopular, UZ) | nisha kashfiyoti |
| Instagram Graph API (Meta) | Reels joylash, insights |
| Gemini API | g'oya, ssenariy, sarlavha, tahlil |
| Gemini TTS | ovoz |
| Gemini rasm generatsiyasi | avatar, muqova, vizual |
| Pexels/Pixabay | stock material |
| Gemini Transcribe / forced alignment | subtitr |
| Telegram Bot API | bildirishnomalar |

Provoyderlar adapter orqali ulanadi (almashtirish oson).

## 10. Rivojlantirish bosqichlari

- **1-bosqich (MVP, 4-5 hafta):** dizayn tizimi + admin panel (Bosh sahifa, Sozlamalar, Onboarding, Skill muharriri); Vercel/Neon/Blob/GitHub Actions skeleti; Nisha kashfiyotchisi + brend paketi; ssenariy -> TTS -> montaj -> QA -> joylash (2 cron); jadval, loglar, avto-pauza, "To'xtatish".
- **2-bosqich (3 hafta):** chuqur QA, subtitr uslubları, cover; analytics + haftalik hisobot.
- **3-bosqich (3 hafta):** Meta App Review (kerak bo'lsa), ko'p akkaunt, rol/byudjet boshqaruvi.
- **4-bosqich (doimiy):** o'rganish sikli, A/B caption/cover testlari.

## 11. Riskler va yechimlar

| Risk | Ehtimol | Yechim |
|---|---|---|
| Reach tushishi / akkaunt cheklanishi | Yuqori | noyob qiymat, xilma-xillik, kunlik 1-2 Reels, qat'iy QA, avto-pauza |
| Meta API/token muammolari | O'rta | onboarding qo'llanma, token avto-yangilash, kunlik 1-3 Reels |
| Mualliflik huquqi | O'rta | faqat litsenziyalangan material, manba logi |
| AI xarajatlari | O'rta | byudjet limiti, arzon model/kesh, xarajat hisobi |
| Noto'g'ri fakt / til xatolari | O'rta | fakt-tekshiruv, editor qadami, ixtiyoriy tasdiq rejimi |
| Token muddati | Past | refresh avto-yangilash, ogohlantirish |
| Platforma qoidalari o'zgarishi | O'rta | adapter arxitekturasi, davriy qayta ko'rish |
| Vercel Hobby nokommersial | O'rta | daromad boshlansa Pro/boshqa hosting |
| Gemini bepul limit / TTS talaffuzi | O'rta | prototipda sinash, kutish/retry, kerak bo'lsa pullik tarif |

## 12. Qabul mezonlari (MVP)

- [ ] Gemini API kaliti Sozlamalar'da kiritiladi, "Ulanishni tekshirish" ishlaydi
- [ ] Skill kiritiladi; ssenariy skill qoidalariga amal qiladi ("Sinab ko'rish")
- [ ] Nisha kashfiyotchisi >=10 nomzodni ball bilan chiqaradi va g'olibni tanlaydi
- [ ] Brend paketi: 10 nom, bio, 4 avatar varianti
- [ ] Instagram Business ulanadi, test Reels API orqali joylanadi
- [ ] Vercel Cron GitHub Actions'ni ishga tushiradi, video Blob/R2'ga yuklanadi
- [ ] 7 kun ketma-ket har kuni 1 Reels qo'lsiz tayyorlanadi va joylanadi
- [ ] Har Reels'da o'zbekcha subtitr, Gemini TTS ovozi, brend elementlari, AI belgisi
- [ ] Xatoda Telegram ogohlantirish; ketma-ket 2 xatoda avto-pauza
- [ ] "To'xtatish" tugmasi darhol to'xtatadi
- [ ] Hammasi bepul tariflarda; limitlar panelda ko'rinadi
- [ ] Dizayn: ko'k palitra, dark/light, mobil moslashuv, Lighthouse Perf & A11y >= 90

