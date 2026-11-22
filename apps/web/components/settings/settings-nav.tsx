"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/settings", label: "API kalitlar", icon: KeyRound },
  { href: "/settings/skill", label: "Skill (AI yo'riqnoma)", icon: Sparkles },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sozlamalar bo'limlari" className="mb-6">
      <ul className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                <tab.icon className="h-4 w-4" aria-hidden />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
