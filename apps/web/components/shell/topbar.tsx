import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SystemStatus } from "./system-status";
import { UserBadge } from "./user-profile";
import { HamburgerButton } from "./hamburger-button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1700px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <HamburgerButton />

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="gradient-brand flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-bold tracking-tight">AutoChannel</span>
          </Link>
        </div>

        <p className="hidden text-xs font-medium text-muted xl:block">
          🎬 AI Video Generator Studio — Professional 9:16 video yaratish
        </p>

        <div className="flex items-center gap-3">
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

          <Suspense fallback={null}>
            <UserBadge />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
