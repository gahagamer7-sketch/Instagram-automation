import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  CircleCheck,
  Clock,
  Cpu,
  DollarSign,
  Film,
  Layers,
  Settings,
  ShieldCheck,
  Sparkles,
  Volume2,
  Wand2,
} from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/lib/dashboard";
import { formatNumber, formatUsd } from "@/lib/format";
import { getSystemSnapshot } from "@/lib/system";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Dashboard — AutoChannel Studio",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex flex-col gap-2 pb-4 border-b border-border">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
        }
      >
        <DashboardHeader />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        }
      >
        <StatsGrid />
      </Suspense>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <QuickVideoCard />
          <Suspense fallback={<CardSkeleton lines={4} />}>
            <SetupChecklist />
          </Suspense>
          <StudioWorkflowCard />
        </div>
        <div className="space-y-5 lg:col-span-4">
          <Suspense fallback={<CardSkeleton lines={4} />}>
            <StudioSummaryCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function QuickVideoCard() {
  const steps = [
    {
      num: "01",
      title: "G'oya yozing",
      desc: "Mavzu kiriting yoki AI trend g'oyalardan tanlang",
      icon: Wand2,
    },
    {
      num: "02",
      title: "AI va Ovoz tanlang",
      desc: "Groq / Gemini ssenariy + tabiiy Gemini TTS",
      icon: Cpu,
    },
    {
      num: "03",
      title: "MP4 yuklab oling",
      desc: "1080×1920 9:16 formatda tayyor HD video",
      icon: Film,
    },
  ];

  return (
    <Card className="relative overflow-hidden border-primary/25">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />

      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white">
              <Clapperboard className="h-4 w-4" aria-hidden />
            </span>
            Video Yaratish Studiyasi
          </span>
        }
        description="G'oya va Rejissyor uslubi asosida 1080×1920 Full HD vertikal video yarating."
        action={
          <Link href="/reels/create" className={buttonClass("gradient", "sm")}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Yangi Video Yasash
          </Link>
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className="group rounded-2xl border border-border bg-surface-2/60 p-4 transition-colors duration-200 hover:border-primary/40"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-accent-cyan">{s.num}</span>
              <s.icon className="h-4 w-4 text-muted group-hover:text-primary transition-colors" aria-hidden />
            </div>
            <p className="font-heading text-sm font-bold text-text">{s.title}</p>
            <p className="mt-1 text-xs text-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function DashboardHeader() {
  const currentUser = await getCurrentUser();
  const user = currentUser?.user;

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Boshqaruv paneli
          </h1>
          {user && (
            <Badge tone="primary" className="font-semibold">
              {user.role === "admin" ? "Admin" : (user.name || user.email)}
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-sm text-muted">
          AI Video Generator Studio — shaxsiy ish maydoningiz va video kutubxonangiz
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Link href="/reels/create" className={buttonClass("gradient", "sm")}>
          <Clapperboard className="h-4 w-4" aria-hidden />
          <span>Video Yaratish</span>
        </Link>

        <Link href="/settings" className={buttonClass("secondary", "sm")}>
          <Settings className="h-4 w-4" aria-hidden />
          <span>Sozlamalar</span>
        </Link>
      </div>
    </div>
  );
}

async function StatsGrid() {
  const currentUser = await getCurrentUser();
  const result = await getDashboardData(currentUser?.channel?.id);

  if (!result.ok) {
    return (
      <Card className="border-danger/40">
        <CardHeader title="Statistika yuklanmadi" description={result.error} />
      </Card>
    );
  }

  const { data } = result;
  const totalVideos =
    data.pendingVideos + data.readyVideos + data.publishedVideos + data.failedVideos;

  const items = [
    {
      title: "Jami videolar",
      value: formatNumber(totalVideos),
      hint: "Sizning video kutubxonangiz",
      icon: Film,
      accent: "text-violet-400 bg-violet-500/15 border-violet-500/30",
    },
    {
      title: "Tayyor MP4",
      value: formatNumber(data.readyVideos + data.publishedVideos),
      hint: "Yuklab olishga tayyor",
      icon: CircleCheck,
      accent: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    },
    {
      title: "Jarayonda",
      value: formatNumber(data.pendingVideos),
      hint: "Render yoki tayyorlanmoqda",
      icon: Clock,
      accent: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
    },
    {
      title: "Bugungi xarajat",
      value: formatUsd(data.todayCostUsd),
      hint: "Shaxsiy API kalitlaringiz",
      icon: DollarSign,
      accent: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.title}
          className="card p-5 transition-all duration-200 hover:border-primary/40"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted">{item.title}</p>
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${item.accent}`}>
              <item.icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <p className="nums font-heading mt-3 text-2xl font-bold text-text">{item.value}</p>
          <p className="mt-1 text-xs text-muted">{item.hint}</p>
        </div>
      ))}
    </section>
  );
}

async function SetupChecklist() {
  const currentUser = await getCurrentUser();
  const snapshot = await getSystemSnapshot(currentUser?.user?.id);

  if (!snapshot.ok) {
    return (
      <Card>
        <CardHeader
          title="Sozlash ro'yxati"
          description={`Baza bilan aloqa yo'q: ${snapshot.error}`}
        />
      </Card>
    );
  }

  const steps = [
    {
      label: "Gemini API kaliti kiritilgan (Ovoz TTS va Matn)",
      done: snapshot.connectedProviders.includes("gemini"),
      href: "/settings",
    },
    {
      label: "Groq API kaliti kiritilgan (Tezkor Ssenariy — ixtiyoriy)",
      done: snapshot.connectedProviders.includes("groq"),
      href: "/settings",
    },
    {
      label: "Pexels API kaliti kiritilgan (Fon videolari — ixtiyoriy)",
      done: snapshot.connectedProviders.includes("pexels"),
      href: "/settings",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const ready = snapshot.connectedProviders.includes("gemini");

  return (
    <Card>
      <CardHeader
        title="Shaxsiy API kalitlar holati"
        description={`${completed}/${steps.length} ta kalit ulangan. Har bir foydalanuvchi faqat o'z shaxsiy kaliti bilan ishlaydi.`}
        action={
          <Badge tone={ready ? "success" : "warning"}>
            <StatusDot tone={ready ? "success" : "warning"} />
            {ready ? "Studiya tayyor" : "Kalit kerak"}
          </Badge>
        }
      />

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="gradient-brand h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.round((completed / steps.length) * 100)}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2.5">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface-2/40 px-3 py-2 text-sm"
          >
            {step.done ? (
              <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                aria-hidden
              />
            )}
            <span className={step.done ? "text-muted line-through" : "text-text"}>
              {step.label}
            </span>
            {!step.done && (
              <Link
                href={step.href}
                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-accent-cyan hover:underline"
              >
                Sozlash
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-border flex justify-end">
        <Link
          href="/reels/create"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-cyan hover:underline"
        >
          <Clapperboard className="h-3.5 w-3.5" />
          Video Studiyani ochish
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function StudioWorkflowCard() {
  const steps = ["G'oya", "AI Ssenariy", "Gemini TTS Ovoz", "Subtitr & Montaj", "MP4 Yuklab olish"];

  return (
    <Card>
      <CardHeader
        title="Video yaratish jarayoni"
        description="Studiyada yaratilgan har bir video shu bosqichlardan o'tib tayyor MP4 faylga aylanadi."
        action={
          <Link href="/reels/create" className="text-xs font-semibold text-accent-cyan hover:underline">
            Studiyaga o&apos;tish
          </Link>
        }
      />
      <ol className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/80 px-3 py-1.5 text-text">
              <span className="nums font-mono text-[11px] text-accent-cyan">0{i + 1}</span>
              {step}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 text-muted" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

async function StudioSummaryCard() {
  const currentUser = await getCurrentUser();
  const result = await getDashboardData(currentUser?.channel?.id);

  if (!result.ok) {
    return (
      <Card>
        <CardHeader title="Videolar holati" description="Baza bilan aloqa yo'q" />
      </Card>
    );
  }

  const { data } = result;
  const rows = [
    { label: "Yuklab olishga tayyor", value: data.readyVideos + data.publishedVideos, tone: "success" as const },
    { label: "Ishlov berilmoqda", value: data.pendingVideos, tone: "primary" as const },
    { label: "Xatolik", value: data.failedVideos, tone: "danger" as const },
  ];

  return (
    <Card className="h-fit">
      <CardHeader
        title="Mening videolarim"
        description="Studiyadagi video fayllar"
        action={
          <Link href="/reels" className="text-xs font-semibold text-accent-cyan hover:underline">
            Barchasi
          </Link>
        }
      />
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface-2/40 px-3.5 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2.5 text-muted">
              <StatusDot tone={row.tone} pulse={row.value > 0 && row.tone === "primary"} />
              {row.label}
            </span>
            <span className="nums font-mono font-semibold text-text">{formatNumber(row.value)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted">
        <p className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
          9:16 Full HD (1080×1920) MP4 eksport
        </p>
        <p className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5 text-violet-400" aria-hidden />
          Groq / Gemini AI + tabiiy Gemini TTS ovoz
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          Shaxsiy API kalitlaringiz AES-256-GCM bilan himoyalangan
        </p>
      </div>
    </Card>
  );
}
