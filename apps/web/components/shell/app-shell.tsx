"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { cn } from "@/lib/cn";

interface AppShellProps {
  children: ReactNode;
  sidebar: ReactNode;
  topbar: ReactNode;
  mobileNav: ReactNode;
}

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellInner {...props} />
    </SidebarProvider>
  );
}

function AppShellInner({ children, sidebar, topbar, mobileNav }: AppShellProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register";
  const isStudioPage = pathname === "/reels/create";

  if (isPublicPage) {
    return (
      <div className="min-h-dvh bg-background text-text">
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="lg:flex min-h-dvh">
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
          {topbar}
          <main
            className={cn(
              "mx-auto w-full flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-10 transition-all duration-300",
              isStudioPage
                ? "max-w-[1700px] lg:px-8"
                : isCollapsed
                  ? "max-w-[1600px] lg:px-8"
                  : "max-w-6xl"
            )}
          >
            {children}
          </main>
        </div>
      </div>
      {mobileNav}
    </>
  );
}
