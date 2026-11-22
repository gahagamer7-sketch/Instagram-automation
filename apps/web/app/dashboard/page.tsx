import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, Rocket, ShieldCheck } from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/lib/dashboard";
import { formatDateTime, formatNumber, formatUsd } from "@/lib/format";
import { getSystemSnapshot } from "@/lib/system";
import { getCurrentUser } from "@/lib/session";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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

async function DashboardHeader() {
  const currentUser = await getCurrentUser();
  const user = currentUser?.user;
  const channel = currentUser?.channel;

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
          {channel
            ? `${channel.name} (${channel.handle ? `@${channel.handle}` : "Instagram"}) uchun shaxsiy tahlil va navbat`
            : "Reels avtomatlashtirish shaxsiy boshqaruv paneli"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {channel?.handle ? (
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text">
            <InstagramIcon className="h-3.5 w-3.5 text-pink-500" />
            <span className="font-medium">@{channel.handle}</span>
          </div>
        ) : (
          <Link
            href="/onboarding?step=4"
            className="flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-500 hover:bg-pink-500/20 transition"
          >
            <InstagramIcon className="h-3.5 w-3.5" />
            <span>Instagram ulash</span>
          </Link>
        )}

        <Link href="/onboarding" className={buttonClass("gradient", "sm")}>
          <Rocket className="h-4 w-4" aria-hidden />
          Onboarding
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
      title: "Keyingi Reels",
      value: data.nextScheduledAt ? formatDateTime(data.nextScheduledAt) : "—",
      hint: data.nextScheduledAt ? "Jadval bo'yicha" : "Jadval hali bo'sh",
    },
    {
      title: "7 kunlik ko'rishlar",
      value: formatNumber(data.plays7d),
      hint: "Instagram Insights tahlili",
    },
    {
      title: "Obunachilar",
      value: formatNumber(data.followers),
      hint: "O'sish dinamikasi",
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
  const snapshot = await getSystemSnapshot();

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
      label: "Instagram Business akkaunt ulangan",
      done: snapshot.hasChannel,
      href: "/onboarding?step=4",
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
  const steps = ["G'oya", "Ssenariy", "Ovoz", "Video", "QA", "Joylash"];

  return (
    <Card>
      <CardHeader
        title="Jonli pipeline"
        description="Har bir Reels shu bosqichlardan to'liq avtomatik o'tadi va Instagram'ga e'lon qilinadi."
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
