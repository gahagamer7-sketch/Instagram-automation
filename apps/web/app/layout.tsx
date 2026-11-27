import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { SidebarUserCard } from "@/components/shell/user-profile";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoChannel — AI Video Studio",
  description:
    "AI Video Studio: g'oya, nisha, brend, ssenariy, o'zbekcha ovoz (TTS), dinamik subtitr va 9:16 HD video montaji.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-background text-text">
        <AppShell
          sidebar={
            <Sidebar
              userSlot={
                <Suspense fallback={null}>
                  <SidebarUserCard />
                </Suspense>
              }
            />
          }
          topbar={<Topbar />}
          mobileNav={<MobileNav />}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
