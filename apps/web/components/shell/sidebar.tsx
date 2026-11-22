"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isActive } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:sticky lg:top-0 lg:block lg:h-dvh">
      <div className="flex h-full flex-col">
        <Link href="/" className="flex items-center gap-3 px-5 py-5">
          <span className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-tight">AutoChannel</span>
            <span className="block text-xs text-muted">Reels avtomatizatsiyasi</span>
          </span>
        </Link>

        <nav aria-label="Asosiy navigatsiya" className="mt-1 flex-1 px-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted hover:bg-surface-2 hover:text-text",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-5 py-4">
          <p className="text-xs text-muted">Bepul tarif rejimi</p>
          <p className="mt-1 text-xs text-muted/80">v0.1 · MVP</p>
        </div>
      </div>
    </aside>
  );
}
