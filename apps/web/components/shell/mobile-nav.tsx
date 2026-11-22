"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { MOBILE_NAV_ITEMS, isActive } from "./nav-items";

/** Mobil pastki navigatsiya (TZ 4.12). */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobil navigatsiya"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] transition",
                  active ? "font-semibold text-primary" : "text-muted",
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                <span className="truncate">{item.label.split(" ")[0]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
