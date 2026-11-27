"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogOut, PanelLeftClose, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isActive } from "./nav-items";
import { logoutAction } from "@/app/login/actions";
import { useSidebar } from "./sidebar-context";

interface SidebarProps {
  userSlot?: ReactNode;
}

export function Sidebar({ userSlot }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-sidebar lg:sticky lg:top-0 lg:block lg:h-dvh transition-all duration-300 ease-in-out z-20 overflow-hidden",
          isCollapsed
            ? "lg:w-0 lg:border-r-0 lg:opacity-0 pointer-events-none"
            : "lg:w-64 lg:border-r lg:opacity-100"
        )}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight">AutoChannel</span>
                <span className="block text-[11px] text-muted">Video Studio SaaS</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text transition"
              title="Menyuni yopish (Ctrl+B)"
              aria-label="Menyuni yopish"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <nav aria-label="Asosiy navigatsiya" className="mt-2 flex-1 px-3 overflow-y-auto">
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

          <div className="border-t border-border px-4 py-4 space-y-3">
            {userSlot}

            <div className="flex items-center justify-between text-xs text-muted px-1">
              <span>Studio Rejimi</span>
              <span className="font-mono text-[11px] opacity-75">v2.0 Pro</span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-muted hover:bg-surface-2 hover:text-danger transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Chiqish</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobil Slide-over Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={closeMobile}
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-250">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-3">
                <span className="gradient-brand flex h-8 w-8 items-center justify-center rounded-xl text-white">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm font-bold">AutoChannel</span>
              </Link>
              <button
                type="button"
                onClick={closeMobile}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text transition"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav aria-label="Mobil navigatsiya" className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMobile}
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

            <div className="border-t border-border px-4 py-4 space-y-3">
              {userSlot}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-muted hover:bg-surface-2 hover:text-danger transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Chiqish</span>
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
