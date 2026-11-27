import type { ComponentType } from "react";
import {
  ChartColumn,
  Clapperboard,
  Film,
  LayoutDashboard,
  Palette,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Mobil pastki navigatsiyada ko'rinadi. */
  mobile?: boolean;
}

/** AI Video Studio sahifalari ro'yxati */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/reels/create", label: "Video Yaratish", icon: Clapperboard, mobile: true },
  { href: "/reels", label: "Mening Videolarim", icon: Film, mobile: true },
  { href: "/settings/skill", label: "Video Qoidalari (Skill)", icon: Palette },
  { href: "/analytics", label: "Statistika", icon: ChartColumn, mobile: true },
  { href: "/settings", label: "Sozlamalar", icon: Settings, mobile: true },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobile);

export function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
