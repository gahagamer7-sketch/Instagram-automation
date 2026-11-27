"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function HamburgerButton() {
  const { isCollapsed, toggleSidebar, toggleMobile } = useSidebar();

  function handleClick() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      toggleMobile();
    } else {
      toggleSidebar();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-2 text-text transition shadow-sm group"
      title={isCollapsed ? "Menyuni ochish (Ctrl+B)" : "Menyuni yopish (Ctrl+B)"}
      aria-label="Asosiy menyuni almashtirish"
    >
      <span className="sr-only">Menyu</span>
      {/* Desktopda holatga qarab icon, mobil uchun standart Menu */}
      <span className="hidden lg:inline-flex">
        {isCollapsed ? (
          <PanelLeftOpen className="h-4 w-4 text-muted group-hover:text-primary transition" />
        ) : (
          <PanelLeftClose className="h-4 w-4 text-muted group-hover:text-primary transition" />
        )}
      </span>
      <span className="lg:hidden inline-flex">
        <Menu className="h-4 w-4 text-muted group-hover:text-primary transition" />
      </span>
    </button>
  );
}
