import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Share2,
  Cpu,
  Layers,
  BarChart3,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Volume2,
} from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export const metadata = {
  title: "AutoChannel — AI Video Studio",
  description:
    "O'zbek tilidagi professional AI Video Studio: nisha kashfiyoti, brend, ssenariy, tabiiy TTS ovoz, 9:16 FFmpeg montaj va yuklab olish.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text selection:bg-primary/30">
      {/* 1. NAVIGATSIYA */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight text-text">AutoChannel</span>
              <span className="hidden sm:inline-block ml-1.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary font-mono">
                AI REELS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted">
            <a href="#how-it-works" className="hover:text-text transition">
              Qanday ishlaydi?
            </a>
            <a href="#features" className="hover:text-text transition">
              Imkoniyatlar
            </a>
            <a href="#comparison" className="hover:text-text transition">
              Taqqoslash
            </a>
            <a href="#tech" className="hover:text-text transition">
              Arxitektura
            </a>
            <a href="#faq" className="hover:text-text transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-muted hover:text-text transition px-3 py-2 rounded-xl hover:bg-surface-2"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl font-semibold transition px-4 py-2 text-xs gradient-brand text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:brightness-110"
            >
              <span>Ro&apos;yxatdan o&apos;tish</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO BO'LIMI */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Orqa fon nur effekti */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-indigo-500/15 to-transparent blur-3xl opacity-70" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Chap tomon: Asosiy chaqiriq */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                <Zap className="h-3.5 w-3.5 text-accent-cyan" />
                <span>O&apos;zbekistonda 1-professional AI Video Studio</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.12]">
                G&apos;oyadan Tayyor Videogacha{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent-cyan bg-clip-text text-transparent">
                  AI Video Studio
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Mavzu kiriting — Groq AI va Gemini ssenariy yozadi, Gemini TTS o&apos;zbek tilida tabiiy ovoz beradi, FFmpeg esa 1080x1920 9:16 formatda dinamik subtitrli tayyor MP4 videoni yaratib beradi.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/reels/create"
                  className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition px-6 py-3.5 text-sm gradient-brand text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] hover:brightness-110"
                >
                  <span>Video Studiyani ochish</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition px-5 py-3.5 text-sm border border-border bg-surface-2 text-text hover:border-primary/50 hover:text-primary"
                >
                  <span>Boshqaruv paneli</span>
                </Link>
              </div>

              {/* Statistika ko'rsatkichlari */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border/80">
                <div className="p-3 rounded-xl bg-surface/60 border border-border">
                  <span className="nums block text-xl font-bold text-text">9:16</span>
                  <span className="text-[11px] text-muted">1080x1920 Full HD</span>
                </div>
                <div className="p-3 rounded-xl bg-surface/60 border border-border">
                  <span className="nums block text-xl font-bold text-success">$0</span>
                  <span className="text-[11px] text-muted">Bepul API kalitlar</span>
                </div>
                <div className="p-3 rounded-xl bg-surface/60 border border-border">
                  <span className="nums block text-xl font-bold text-text">~1.2s</span>
                  <span className="text-[11px] text-muted">Groq ssenariy tezligi</span>
                </div>
                <div className="p-3 rounded-xl bg-surface/60 border border-border">
                  <span className="nums block text-xl font-bold text-primary">4 ovoz</span>
                  <span className="text-[11px] text-muted">Gemini o&apos;zbekcha TTS</span>
                </div>
              </div>
            </div>

            {/* O'ng tomon: Interaktiv 9:16 Reels Smartfon Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[290px] sm:max-w-[320px] rounded-[42px] border-4 border-border/80 bg-surface shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-3">
                {/* Telefon dinamikasi */}
                <div className="mx-auto mb-2 h-4 w-24 rounded-full bg-border/60" />

                {/* 9:16 Ekran */}
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[32px] bg-gradient-to-b from-[#0F172A] via-[#0B1220] to-[#080E1A] border border-border flex flex-col justify-between p-4">
                  {/* Yuqori qism: Holat */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-white backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="font-semibold text-[10px]">AI VIDEO STUDIO</span>
                    </div>
                    <span className="text-white/70 text-[10px] font-mono">1080x1920 60FPS</span>
                  </div>

                  {/* O'rta qism: Dinamik Subtitr va Hook */}
                  <div className="space-y-3 my-auto text-center px-1">
                    <div className="inline-block rounded-lg bg-primary/20 border border-primary/40 px-3 py-1 text-xs font-bold text-accent-cyan shadow-sm">
                      🔥 FOYDALI ODATHAR #42
                    </div>
                    <div className="rounded-2xl bg-black/75 p-3.5 backdrop-blur border border-white/10 shadow-lg">
                      <p className="text-sm font-extrabold text-white leading-snug">
                        &quot;90% insonlar ertalab qiladigan 1 ta xato — butun kuningizni barbod qiladi!&quot;
                      </p>
                    </div>
                  </div>

                  {/* Quyi qism: Kanal ma'lumoti va audio */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-white">@foydali.odatlar</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                          <Volume2 className="h-3 w-3 text-accent-cyan" />
                          <span className="truncate">Gemini Northern Uzbek TTS (LUFS -14)</span>
                        </div>
                      </div>

                      {/* Reaktsiyalar */}
                      <div className="flex flex-col items-center gap-2 text-white">
                        <span className="text-[10px] font-bold">❤️ 18.4K</span>
                        <span className="text-[10px] font-bold">💬 942</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent-cyan rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 5-BOSQICHLI ISH OQIMI (HOW IT WORKS) */}
      <section id="how-it-works" className="py-20 border-t border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
              Ishlash Tamoyili
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text">
              G&apos;oyadan Tayyor Videogacha 5 Bosqich
            </h3>
            <p className="text-sm text-muted">
              Har bir bosqich studiya ichida bir tugma bilan bajariladi va tayyor MP4 fayl sifatida beriladi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "G'oya & Mavzu",
                desc: "Mavzuni kiriting yoki AI trend g'oyalar generatoridan tanlang.",
                icon: Cpu,
              },
              {
                step: "02",
                title: "AI Ssenariy & Hook",
                desc: "Groq AI yoki Gemini 0-3s viral hook va shot-list yaratadi.",
                icon: Bot,
              },
              {
                step: "03",
                title: "Tabiiy TTS Ovoz",
                desc: "Gemini Northern Uzbek modeli orqali professional ovozlashtirish.",
                icon: Volume2,
              },
              {
                step: "04",
                title: "FFmpeg Montaj",
                desc: "1080x1920 9:16 video, rangli ASS subtitrlar va Pexels stock fon.",
                icon: Layers,
              },
              {
                step: "05",
                title: "MP4 Yuklab Olish",
                desc: "Tayyor video va muqovani (cover) kompyuteringizga yuklab oling.",
                icon: Share2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-border bg-surface p-5 space-y-3 relative group hover:border-primary/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-primary/30 group-hover:text-primary transition">
                      {item.step}
                    </span>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-text text-sm">{item.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TAQQOSLASH (COMPARISON) */}
      <section id="comparison" className="py-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
              Samaradorlik
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text">
              An&apos;anaviy Jamoa vs AutoChannel AI
            </h3>
            <p className="text-sm text-muted">
              Nega zamonaviy kontent yaratuvchilar sun&apos;iy intellekt avtomatizatsiyasiga o&apos;tmoqda?
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="grid grid-cols-3 p-4 border-b border-border bg-surface-2 text-xs font-bold text-muted uppercase tracking-wider">
              <div>Vazifa / Xususiyat</div>
              <div className="text-danger flex items-center gap-1.5">
                <XCircle className="h-4 w-4" />
                <span>An&apos;anaviy Usul</span>
              </div>
              <div className="text-success flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>AutoChannel AI</span>
              </div>
            </div>

            <div className="divide-y divide-border text-xs">
              {[
                {
                  task: "Oylik xarajat",
                  traditional: "$500 - $1,500 / oy",
                  autochannel: "$0 / oy (Bepul tariflar)",
                },
                {
                  task: "Ssenariy tayyorlash",
                  traditional: "2 - 3 soat har video uchun",
                  autochannel: "5 soniya (Gemini AI)",
                },
                {
                  task: "Ovoz yozish & diktor",
                  traditional: "Mikrofon, studiya, qayta yozish",
                  autochannel: "Tabiiy o'zbekcha TTS (LUFS -14)",
                },
                {
                  task: "Montaj & subtitrlar",
                  traditional: "Premiere / CapCut (2-4 soat)",
                  autochannel: "FFmpeg render (45 soniya)",
                },
                {
                  task: "Tayyor video olish",
                  traditional: "Soatlab render kutish",
                  autochannel: "MP4 va Cover darhol tayyor",
                },
                {
                  task: "Inson omili / uzilish",
                  traditional: "Kasallik, charchoq, ta'tillar",
                  autochannel: "24/7 tezkor AI studiya",
                },
              ].map((row) => (
                <div key={row.task} className="grid grid-cols-3 p-4 items-center">
                  <div className="font-semibold text-text">{row.task}</div>
                  <div className="text-muted">{row.traditional}</div>
                  <div className="font-semibold text-success">{row.autochannel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TEXNOLOGIK ARXITEKTURA (ZERO-COST STACK) */}
      <section id="tech" className="py-20 border-t border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
              Zero-Cost Arxitektura
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text">
              100% Bepul Tariflarda Ishlovchi Tizim
            </h3>
            <p className="text-sm text-muted">
              Hech qanday oylik to&apos;lovlarsiz ishga tushirish imkonini beruvchi mustahkam texnologiyalar to&apos;plami.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Gemini API (Free Tier)",
                desc: "Ssenariy yaratish, QA tekshiruvi va tabiiy o'zbek tili ovozi (TTS) mutlaqo bepul.",
                badge: "Google AI",
              },
              {
                title: "Groq AI (Avto-Model)",
                desc: "API kalitingizdagi eng kuchli modelni avtomatik tanlab, ssenariyni ~1.2 soniyada yozadi.",
                badge: "Ultra Fast",
              },
              {
                title: "FFmpeg 1080x1920 Render",
                desc: "Serverless va GitHub Actions worker orqali 60FPS video va ASS subtitr montaji.",
                badge: "FFmpeg Core",
              },
              {
                title: "Vercel Serverless & Cron",
                desc: "Kunlik ishlab chiqarish va nashriyot jadvallarini avtomatik yurgizish.",
                badge: "Vercel Edge",
              },
              {
                title: "PostgreSQL & Prisma",
                desc: "Lokal PGlite va bulutli Neon/Supabase orqali ma'lumotlar bazasi boshqaruvi.",
                badge: "DB Engine",
              },
              {
                title: "Telegram Bot API",
                desc: "Yangi video tayyor bo'lganda, joylanganda va xatoliklarda darhol xabarnoma.",
                badge: "Alerts",
              },
            ].map((tech) => (
              <div key={tech.title} className="p-5 rounded-2xl border border-border bg-surface space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text text-sm">{tech.title}</span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary font-bold">
                    {tech.badge}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ (KO'P BERILADIGAN SAVOLLAR) */}
      <section id="faq" className="py-20 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-primary">
              FAQ
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text">
              Tez-tez Beriladigan Savollar
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Har bir foydalanuvchi o'z API kaliti bilan ishlaydimi?",
                a: "Ha! Har bir akkaunt o'zining shaxsiy Gemini, Groq va Pexels API kalitlarini AES-256-GCM shifrlash bilan saqlaydi. Kalitlar boshqa foydalanuvchilarga umuman ko'rinmaydi.",
              },
              {
                q: "O'zbek tili talaffuzi qanchalik tabiiy?",
                a: "Biz Google Gemini'ning Northern Uzbek TTS modelidan foydalanamiz. Talaffuz jonli diktorga juda yaqin, so'z urg'ulari aniq va LUFS -14 xalqaro ovoz me'yoriga mos ravishda normalizatsiya qilinadi.",
              },
              {
                q: "Haqiqatan ham bepulmi?",
                a: "Ha! Tizim Gemini va Groq bepul API kvotalari doirasida ishlaydi. Shaxsiy API kalitingizni ulab bemalol video yaratishingiz mumkin.",
              },
              {
                q: "Ssenariylarni o'zim ko'rib, tahrirlay olamanmi?",
                a: "Albatta. Kontent kalendari va Reels kutubxonasida har bir ssenariyni o'qish, tahrirlash, hook yoki CTA matnini o'zgartirish imkoniyati mavjud.",
              },
              {
                q: "Xatolik yuz bersa tizim nima qiladi?",
                a: "Auto-pause (avto-pauza) himoyasi mavjud. Ketma-ket 2 ta xatolik bo'lsa, tizim o'z-o'zini to'xtatadi va Telegram botingizga darhol sababini ko'rsatgan holda ogohlantirish yuboradi.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border bg-surface space-y-2">
                <h4 className="font-bold text-text text-sm flex items-center gap-2">
                  <span className="text-primary font-mono">Q:</span>
                  {faq.q}
                </h4>
                <p className="text-xs text-muted leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. YAKUNIY CTA BO'LIMI */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-surface to-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Bir necha daqiqada ishga tushiring</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-extrabold text-text tracking-tight">
            Bugunoq O&apos;zingizning AI Video Studiyangizni Ishga Tushiring
          </h3>

          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto">
            Shaxsiy API kalitingizni kiriting, mavzu yozing va bir necha soniyada professional 9:16 video yarating.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition px-6 py-3.5 text-sm gradient-brand text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] hover:brightness-110"
            >
              <span>Bepul hisob ochish</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition px-5 py-3.5 text-sm border border-border bg-surface-2 text-text hover:border-primary/50 hover:text-primary"
            >
              <span>Tizimga kirish</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-border py-8 bg-surface-2/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">AutoChannel</span>
            <span>·</span>
            <span>AI Video Generator Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-text transition">
              Tizimga kirish
            </Link>
            <Link href="/dashboard" className="hover:text-text transition">
              Dashboard
            </Link>
            <Link href="/reels/create" className="hover:text-text transition">
              Video Studio
            </Link>
          </div>
          <p className="text-[11px] opacity-75">
            © 2026 AutoChannel. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}
