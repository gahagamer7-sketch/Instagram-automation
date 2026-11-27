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
          "hidden shrink-0 border-r border-border bg-sidebar/95 backdrop-blur-xl lg:sticky lg:top-0 lg:block lg:h-dvh transition-all duration-300 ease-in-out z-20 overflow-hidden",
          isCollapsed
            ? "lg:w-0 lg:border-r-0 lg:opacity-0 pointer-events-none"
            : "lg:w-64 lg:border-r lg:opacity-100",
        )}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <span className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[0_6px_18px_rgba(124,58,237,0.35)] transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="font-heading block text-sm font-bold leading-tight text-text">
                  AutoChannel
                </span>
                <span className="block text-[11px] font-medium text-accent-cyan">
                  AI Video Studio
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text transition-colors duration-200"
              title="Menyuni yopish (Ctrl+B)"
              aria-label="Menyuni yopish"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <nav aria-label="Asosiy navigatsiya" className="mt-3 flex-1 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 border",
                        active
                          ? "border-primary/30 bg-primary/15 font-semibold text-white shadow-[0_4px_16px_rgba(124,58,237,0.18)]"
                          : "border-transparent text-muted hover:bg-surface-2/70 hover:text-text",
                      )}
                    >
                      <item.icon
                        className={cn("h-[18px] w-[18px]", active ? "text-accent-cyan" : "")}
                        aria-hidden
                      />
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
              <span>Studio Edition</span>
              <span className="font-mono text-[11px] text-accent-cyan/80">Pro Max</span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-muted hover:bg-danger/10 hover:text-red-300 transition-colors duration-200"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={closeMobile}
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-3">
                <span className="gradient-brand flex h-8 w-8 items-center justify-center rounded-xl text-white">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-heading text-sm font-bold text-text">AutoChannel</span>
              </Link>
              <button
                type="button"
                onClick={closeMobile}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-text transition-colors"
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
                          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 border",
                          active
                            ? "border-primary/30 bg-primary/15 font-semibold text-white"
                            : "border-transparent text-muted hover:bg-surface-2 hover:text-text",
                        )}
                      >
                        <item.icon
                          className={cn("h-[18px] w-[18px]", active ? "text-accent-cyan" : "")}
                          aria-hidden
                        />
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
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-muted hover:bg-danger/10 hover:text-red-300 transition-colors"
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
