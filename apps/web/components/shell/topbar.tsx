import { Suspense } from "react";
import Link from "next/link";
import { Clapperboard, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SystemStatus } from "./system-status";
import { UserBadge } from "./user-profile";
import { HamburgerButton } from "./hamburger-button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1700px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <HamburgerButton />

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <span className="gradient-brand flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-heading text-sm font-bold tracking-tight text-text">
              AutoChannel
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-medium text-muted xl:flex">
          <Clapperboard className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
          <span>AI Video Studio — 1080×1920 Full HD Generator</span>
        </div>

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
