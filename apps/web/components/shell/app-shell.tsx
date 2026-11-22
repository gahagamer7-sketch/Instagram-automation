"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
  sidebar: ReactNode;
  topbar: ReactNode;
  mobileNav: ReactNode;
}

export function AppShell({ children, sidebar, topbar, mobileNav }: AppShellProps) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register";

  if (isPublicPage) {
    return (
      <div className="min-h-dvh bg-background text-text">
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="lg:flex">
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          {topbar}
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
      {mobileNav}
    </>
  );
}
