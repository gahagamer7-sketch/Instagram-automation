"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface SidebarContextValue {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "autochannel_sidebar_collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();

  // Sahifa o'zgarganda mobil menyuni avtomatik yopish
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Dastlabki holatni localStorage'dan o'qish
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // SSR yoki localStorage cheklovi
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // e'tiborsiz qoldirish
      }
      return next;
    });
  }, []);

  const setCollapsed = useCallback((val: boolean) => {
    setIsCollapsed(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
      // e'tiborsiz qoldirish
    }
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Klaviatura klavishlari: Ctrl+B yoki Cmd+B bosilganda menyuni ochish/yopish
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setCollapsed,
        isMobileOpen,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar faqat SidebarProvider ichida ishlatilishi kerak");
  }
  return ctx;
}
