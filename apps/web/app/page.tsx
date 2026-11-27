import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clapperboard,
  Cpu,
  Download,
  Film,
  Flame,
  Layers,
  Sparkles,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "AutoChannel — AI Video Studio",
  description:
    "O'zbek tilidagi professional AI Video Studio: g'oya, ssenariy, tabiiy TTS ovoz, dinamik subtitr va 9:16 HD video montaji.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-text selection:bg-primary/30">
      {/* 1. NAVIGATSIYA */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-[0_6px_18px_rgba(124,58,237,0.38)] transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <span className="font-heading font-bold text-base tracking-tight text-text">
                AutoChannel
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-md border border-primary/30 bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300 font-mono">
                STUDIO PRO
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted">
            <a href="#how-it-works" className="hover:text-text transition-colors">
              Qanday ishlaydi?
            </a>
            <a href="#comparison" className="hover:text-text transition-colors">
              Taqqoslash
            </a>
            <a href="#tech" className="hover:text-text transition-colors">
              Arxitektura
            </a>
            <a href="#faq" className="hover:text-text transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-muted hover:text-text transition-colors px-3 py-2 rounded-xl hover:bg-surface-2"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl font-semibold transition px-4 py-2 text-xs gradient-brand text-white shadow-[0_6px_18px_rgba(124,58,237,0.35)] hover:brightness-110"
            >
              <span>Ro&apos;yxatdan o&apos;tish</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO BO'LIMI */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-accent-indigo/15 to-accent-cyan/10 blur-[120px]" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3.5 py-1.5 text-xs font-semibold text-violet-300">
                <Zap className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
                <span>O&apos;zbek tilidagi professional AI Video Studio</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-[1.1]">
                G&apos;oyadan Tayyor Videogacha{" "}
                <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                  AI Video Studio
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Mavzu kiriting — Groq AI va Gemini ssenariy yozadi, Gemini TTS o&apos;zbek tilida tabiiy ovoz beradi, FFmpeg esa 1080×1920 9:16 formatda dinamik subtitrli tayyor MP4 videoni yaratib beradi.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/reels/create"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition px-6 py-3.5 text-sm gradient-brand text-white shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:brightness-110"
                >
                  <Clapperboard className="h-4 w-4" aria-hidden />
                  <span>Video Studiyani ochish</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition px-5 py-3.5 text-sm border border-border bg-surface-2/80 text-text hover:border-primary/50"
                >
                  <span>Boshqaruv paneli</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border">
                <div className="card p-3.5">
                  <span className="nums font-mono block text-xl font-bold text-text">9:16</span>
                  <span className="text-[11px] text-muted">1080×1920 Full HD</span>
                </div>
                <div className="card p-3.5">
                  <span className="nums font-mono block text-xl font-bold text-emerald-400">$0</span>
                  <span className="text-[11px] text-muted">Shaxsiy bepul API</span>
                </div>
                <div className="card p-3.5">
                  <span className="nums font-mono block text-xl font-bold text-text">~1.2s</span>
                  <span className="text-[11px] text-muted">Groq ssenariy tezligi</span>
                </div>
                <div className="card p-3.5">
                  <span className="nums font-mono block text-xl font-bold text-accent-cyan">4 ovoz</span>
                  <span className="text-[11px] text-muted">Gemini o&apos;zbekcha TTS</span>
                </div>
              </div>
            </div>

            {/* O'ng tomon: 9:16 Smartfon Studio Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[300px] sm:max-w-[325px] rounded-[42px] border border-white/15 bg-gradient-to-b from-surface-2 to-background shadow-2xl p-3.5 neon-glow">
                <div className="mx-auto mb-2.5 h-4 w-24 rounded-full bg-background border border-border" />

                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[32px] bg-gradient-to-b from-[#131b2e] via-[#0b1120] to-[#070b14] border border-border flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-white backdrop-blur border border-white/10">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold text-[10px]">AI VIDEO STUDIO</span>
                    </div>
                    <span className="text-white/75 text-[10px] font-mono">1080×1920</span>
                  </div>

                  <div className="space-y-3 my-auto text-center px-1">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/25 border border-primary/40 px-3 py-1 text-xs font-bold text-accent-cyan">
                      <Flame className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                      <span>FOYDALI ODATLAR</span>
                    </div>
                    <div className="rounded-2xl bg-black/75 p-4 backdrop-blur border border-white/10 shadow-lg">
                      <p className="font-heading text-sm font-bold text-white leading-snug">
                        &quot;90% insonlar ertalab qiladigan 1 ta xato — butun kuningizni barbod qiladi!&quot;
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-heading font-bold text-xs text-white">Studio Render</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                          <Volume2 className="h-3 w-3 text-accent-cyan" aria-hidden />
                          <span className="truncate">Gemini Northern Uzbek TTS</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-success/20 border border-success/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        MP4
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                      <div className="h-full w-3/4 gradient-brand rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 5-BOSQICHLI ISH OQIMI */}
      <section id="how-it-works" className="py-20 border-t border-border bg-surface/35">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-accent-cyan">
              Ishlash Tamoyili
            </h2>
            <h3 className="font-heading text-3xl sm:text-4xl font-bold text-text">
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
                desc: "1080×1920 9:16 video, rangli ASS subtitrlar va Pexels stock fon.",
                icon: Layers,
              },
              {
                step: "05",
                title: "MP4 Yuklab Olish",
                desc: "Tayyor video va muqovani (cover) kompyuteringizga yuklab oling.",
                icon: Download,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="card p-5 space-y-3 group hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-violet-400/50 group-hover:text-accent-cyan transition-colors">
                      {item.step}
                    </span>
                    <Icon className="h-5 w-5 text-accent-cyan" aria-hidden />
                  </div>
                  <h4 className="font-heading font-bold text-text text-sm">{item.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. TAQQOSLASH */}
      <section id="comparison" className="py-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-accent-cyan">
              Samaradorlik
            </h2>
            <h3 className="font-heading text-3xl sm:text-4xl font-bold text-text">
              An&apos;anaviy Montaj vs AutoChannel Studio
            </h3>
            <p className="text-sm text-muted">
              Ssenariy yozish, diktor yollash va montajga ketadigan soatlarni bir necha soniyaga qisqartiring.
            </p>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="grid grid-cols-3 p-4 border-b border-border bg-surface-2/80 text-xs font-bold text-muted uppercase tracking-wider">
              <div>Vazifa / Xususiyat</div>
              <div className="text-red-400 flex items-center gap-1.5">
                <XCircle className="h-4 w-4" aria-hidden />
                <span>An&apos;anaviy Usul</span>
              </div>
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                <span>AutoChannel Studio</span>
              </div>
            </div>

            <div className="divide-y divide-border text-xs">
              {[
                {
                  task: "Oylik xarajat",
                  traditional: "$500 - $1,500 / oy",
                  autochannel: "$0 / oy (Shaxsiy bepul API)",
                },
                {
                  task: "Ssenariy tayyorlash",
                  traditional: "2 - 3 soat har video uchun",
                  autochannel: "~1.2 soniya (Groq AI / Gemini)",
                },
                {
                  task: "Ovoz yozish & diktor",
                  traditional: "Mikrofon, studiya, qayta yozish",
                  autochannel: "Tabiiy o'zbekcha Gemini TTS",
                },
                {
                  task: "Montaj & subtitrlar",
                  traditional: "Premiere / CapCut (2-4 soat)",
                  autochannel: "FFmpeg 1080×1920 render",
                },
                {
                  task: "Tayyor video olish",
                  traditional: "Soatlab kutish",
                  autochannel: "MP4 va Cover darhol tayyor",
                },
              ].map((row) => (
                <div key={row.task} className="grid grid-cols-3 p-4 items-center">
                  <div className="font-semibold text-text">{row.task}</div>
                  <div className="text-muted">{row.traditional}</div>
                  <div className="font-semibold text-emerald-400">{row.autochannel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TEXNOLOGIK ARXITEKTURA */}
      <section id="tech" className="py-20 border-t border-border bg-surface/35">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-accent-cyan">
              Texnologik Stek
            </h2>
            <h3 className="font-heading text-3xl sm:text-4xl font-bold text-text">
              Zamonaviy AI Video Studiya Arxitekturasi
            </h3>
            <p className="text-sm text-muted">
              Har bir foydalanuvchi uchun izolyatsiyalangan, tezkor va bepul tariflarda ishlaydigan texnologiyalar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Gemini AI & TTS",
                desc: "Ssenariy yozish va tabiiy o'zbek tilidagi diktor ovozini (4 xil ovoz) sintez qilish.",
                badge: "Google AI",
              },
              {
                title: "Groq AI (Avto-Model)",
                desc: "API kalitingizdagi eng kuchli modelni avtomatik aniqlab, ssenariyni ~1.2s da yaratadi.",
                badge: "Ultra Fast",
              },
              {
                title: "FFmpeg 1080×1920 Render",
                desc: "9:16 vertikal Full HD video, karaoke ASS subtitrlar va muqova generatsiyasi.",
                badge: "FFmpeg Core",
              },
              {
                title: "Pexels Stock Video",
                desc: "Mavzuga mos vertikal HD fon videolari va kadrlarni avtomatik birlashtirish.",
                badge: "HD Media",
              },
              {
                title: "PostgreSQL & Prisma",
                desc: "Har bir foydalanuvchining videolari va shaxsiy API kalitlari alohida izolyatsiyada.",
                badge: "Multi-Tenant",
              },
              {
                title: "AES-256-GCM Shifrlash",
                desc: "Shaxsiy API kalitlaringiz serverda shifrlangan holda saqlanadi va boshqalarga ko'rinmaydi.",
                badge: "Security",
              },
            ].map((tech) => (
              <div key={tech.title} className="card p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-text text-sm">{tech.title}</span>
                  <span className="rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-mono text-violet-300 font-bold">
                    {tech.badge}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="py-20 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-accent-cyan">
              FAQ
            </h2>
            <h3 className="font-heading text-3xl sm:text-4xl font-bold text-text">
              Tez-tez Beriladigan Savollar
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Har bir foydalanuvchi o'z shaxsiy API kaliti bilan ishlaydimi?",
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
                q: "Yaratilgan videolarni qanday yuklab olaman?",
                a: "Video tayyor bo'lgach studiyaning o'zida ko'rishingiz, MP4 faylni, JPG muqovani va post matnini bir klik bilan yuklab olishingiz mumkin.",
              },
            ].map((faq, i) => (
              <div key={i} className="card p-5 space-y-2">
                <h4 className="font-heading font-bold text-text text-sm flex items-center gap-2">
                  <span className="text-accent-cyan font-mono">Q:</span>
                  {faq.q}
                </h4>
                <p className="text-xs text-muted leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. YAKUNIY CTA */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-surface/50 to-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3.5 py-1.5 text-xs font-semibold text-violet-300">
            <Film className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
            <span>Bir necha daqiqada ishga tushiring</span>
          </div>

          <h3 className="font-heading text-3xl sm:text-5xl font-bold text-text tracking-tight">
            Bugunoq O&apos;zingizning AI Video Studiyangizni Ishga Tushiring
          </h3>

          <p className="text-sm sm:text-base text-muted max-w-xl mx-auto">
            Shaxsiy API kalitingizni kiriting, mavzu yozing va bir necha soniyada professional 9:16 video yarating.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition px-6 py-3.5 text-sm gradient-brand text-white shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:brightness-110"
            >
              <span>Bepul hisob ochish</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            <Link
              href="/login"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition px-5 py-3.5 text-sm border border-border bg-surface-2 text-text hover:border-primary/50"
            >
              <span>Tizimga kirish</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-border py-8 bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-text">AutoChannel</span>
            <span>·</span>
            <span>AI Video Generator Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-text transition-colors">
              Tizimga kirish
            </Link>
            <Link href="/dashboard" className="hover:text-text transition-colors">
              Dashboard
            </Link>
            <Link href="/reels/create" className="hover:text-text transition-colors">
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
