import type { ComponentType } from "react";
import {
  ChartColumn,
  CalendarDays,
  Clapperboard,
  Compass,
  LayoutDashboard,
  ListChecks,
  Palette,
  Settings,
  Workflow,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Mobil pastki navigatsiyada ko'rinadi (TZ 4.12). */
  mobile?: boolean;
}

/** Sahifalar ro'yxati — TZ 4.12. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/pipeline", label: "Jonli pipeline", icon: Workflow, mobile: true },
  { href: "/reels", label: "Reels kutubxonasi", icon: Clapperboard, mobile: true },
  { href: "/calendar", label: "Kontent kalendar", icon: CalendarDays },
  { href: "/niche", label: "Nisha tahlili", icon: Compass },
  { href: "/brand", label: "Brend studiyasi", icon: Palette },
  { href: "/analytics", label: "Statistika", icon: ChartColumn, mobile: true },
  { href: "/logs", label: "Navbat va loglar", icon: ListChecks },
  { href: "/settings", label: "Sozlamalar", icon: Settings, mobile: true },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobile);

export function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
