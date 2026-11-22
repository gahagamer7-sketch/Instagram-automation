import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SystemStatus } from "./system-status";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <span className="gradient-brand flex h-8 w-8 items-center justify-center rounded-lg text-white">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold">AutoChannel</span>
        </Link>

        <p className="hidden text-sm text-muted lg:block">
          Avtomatik Reels kanali — boshqaruv paneli
        </p>

        <Suspense
          fallback={
            <div className="flex items-center gap-2" aria-busy>
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-9 w-28" />
            </div>
          }
        >
          <SystemStatus />
        </Suspense>
      </div>
    </header>
  );
}
