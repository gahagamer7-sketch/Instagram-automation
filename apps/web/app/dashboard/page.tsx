import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Clapperboard, CircleCheck, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/lib/dashboard";
import { formatDateTime, formatNumber, formatUsd } from "@/lib/format";
import { getSystemSnapshot } from "@/lib/system";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Dashboard — AutoChannel",
};

export default function DashboardPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="mb-6 flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        }
      >
        <DashboardHeader />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        }
      >
        <StatsGrid />
      </Suspense>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Video Yaratish bo'limi */}
          <Suspense fallback={<CardSkeleton lines={4} />}>
            <QuickVideoCard />
          </Suspense>
          <Suspense fallback={<CardSkeleton lines={5} />}>
            <SetupChecklist />
          </Suspense>
          <PipelineCard />
        </div>
        <div className="space-y-4">
          <Suspense fallback={<CardSkeleton lines={3} />}>
            <QueueCard />
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function QuickVideoCard() {
  return (
    <Card className="border-primary/20">
      <CardHeader
        title="🎬 Video Yaratish Studiyasi"
        description="G'oya va Skill asosida 1080x1920 formatdagi to'liq avtomatlashgan video yarating."
        action={
          <Link href="/reels/create" className={buttonClass("gradient", "sm")}>
            <Clapperboard className="h-4 w-4" aria-hidden />
            Yangi Video Yasash
          </Link>
        }
      />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-xs font-semibold text-muted">1-qadam</p>
          <p className="mt-0.5 text-sm font-bold text-text">G'oya yozing</p>
          <p className="text-xs text-muted">Video mavzusi yoki g'oyasini kiriting</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-xs font-semibold text-muted">2-qadam</p>
          <p className="mt-0.5 text-sm font-bold text-text">AI Tanlang</p>
          <p className="text-xs text-muted">Groq (tezkor) yoki Gemini (kuchli)</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <p className="text-xs font-semibold text-muted">3-qadam</p>
          <p className="mt-0.5 text-sm font-bold text-text">Video yuklab oling</p>
          <p className="text-xs text-muted">MP4 formatida tayyor video</p>
        </div>
      </div>
    </Card>
  );
}

async function DashboardHeader() {
  const currentUser = await getCurrentUser();
  const user = currentUser?.user;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Boshqaruv paneli
          </h1>
          {user && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {user.role === "admin" ? "Admin" : (user.name || user.email)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">
          AI Video Generator Studio — G&apos;oya kiriting va to&apos;liq video yarating
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/reels/create"
          className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Video Yaratish</span>
        </Link>

        <Link href="/settings" className={buttonClass("gradient", "sm")}>
          <Rocket className="h-4 w-4" aria-hidden />
          Sozlamalar
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
        <CardHeader
          title="Statistika yuklanmadi"
          description={result.error}
        />
      </Card>
    );
  }

  const { data } = result;

  const items = [
    {
      title: "Keyingi Video",
      value: data.nextScheduledAt ? formatDateTime(data.nextScheduledAt) : "—",
      hint: data.nextScheduledAt ? "Jadval bo'yicha" : "Jadval hali bo'sh",
    },
    {
      title: "Jami yaratilgan videolar",
      value: formatNumber(data.plays7d),
      hint: "Video yaratish statistikasi",
    },
    {
      title: "Tayyor videolar",
      value: formatNumber(data.followers),
      hint: "Yuklab olishga tayyor",
    },
    {
      title: "Bugungi xarajat",
      value: formatUsd(data.todayCostUsd),
      hint: "Bepul tarif limiti ichida",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="card p-5">
          <p className="text-sm text-muted">{item.title}</p>
          <p className="nums mt-2 text-2xl font-semibold">{item.value}</p>
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
      label: "Gemini API kaliti kiritilgan",
      done: snapshot.connectedProviders.includes("gemini"),
      href: "/settings",
    },
    {
      label: "Groq API kaliti kiritilgan (ixtiyoriy)",
      done: snapshot.connectedProviders.includes("groq"),
      href: "/settings",
    },
    {
      label: "Avtomatik rejim yoqilgan",
      done: snapshot.autoMode,
      href: "/settings",
    },
    {
      label: "Tizim to'xtatilmagan",
      done: !snapshot.paused,
      href: "/pipeline",
    },
  ];

  const completed = steps.filter((s) => s.done).length;

  return (
    <Card>
      <CardHeader
        title="Ishga tushirish ro'yxati"
        description={`${completed}/${steps.length} qadam bajarilgan. Qolganlari Onboarding'da bajariladi.`}
        action={
          <Badge tone={completed === steps.length ? "success" : "warning"}>
            <StatusDot tone={completed === steps.length ? "success" : "warning"} />
            {completed === steps.length ? "Tayyor" : "Sozlash kerak"}
          </Badge>
        }
      />

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="gradient-brand h-full rounded-full transition-all"
          style={{ width: `${Math.round((completed / steps.length) * 100)}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2 text-sm">
            {step.done ? (
              <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                aria-hidden
              />
            )}
            <span className={step.done ? "text-muted line-through" : ""}>
              {step.label}
            </span>
            {!step.done && (
              <Link
                href={step.href}
                className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Bajarish
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-border flex justify-end">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Rocket className="h-3.5 w-3.5" />
          Onboarding ustasini ochish
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function PipelineCard() {
  const steps = ["G'oya", "Ssenariy", "Ovoz", "Video", "QA", "Tayyor"];

  return (
    <Card>
      <CardHeader
        title="Jonli pipeline"
        description="Har bir video shu bosqichlardan to'liq avtomatik o'tadi va yuklab olishga tayyor bo'ladi."
        action={
          <Link href="/pipeline" className="text-sm text-primary hover:underline">
            Batafsil
          </Link>
        }
      />
      <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5">
              <span className="nums text-xs text-muted">{i + 1}</span>
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="text-muted" aria-hidden>
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

async function QueueCard() {
  const currentUser = await getCurrentUser();
  const result = await getDashboardData(currentUser?.channel?.id);

  if (!result.ok) {
    return (
      <Card>
        <CardHeader title="Navbat" description="Baza bilan aloqa yo'q" />
      </Card>
    );
  }

  const { data } = result;
  const rows = [
    { label: "Ishlov berilmoqda", value: data.pendingVideos, tone: "primary" as const },
    { label: "Joylashga tayyor", value: data.readyVideos, tone: "warning" as const },
    { label: "Joylandi", value: data.publishedVideos, tone: "success" as const },
    { label: "Xato", value: data.failedVideos, tone: "danger" as const },
  ];

  return (
    <Card>
      <CardHeader title="Navbat holati" description="Video statuslari bo'yicha" />
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted">
              <StatusDot tone={row.tone} pulse={row.value > 0 && row.tone === "primary"} />
              {row.label}
            </span>
            <span className="nums font-semibold">{formatNumber(row.value)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Rocket className="h-3.5 w-3.5" aria-hidden />
        Kunlik limit: 1 Reels (Sozlamalarda o&apos;zgartiriladi)
      </p>
      <p className="mt-2 flex items-center gap-2 text-xs text-muted">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        QA o&apos;tmasa video joylanmaydi
      </p>
    </Card>
  );
}
