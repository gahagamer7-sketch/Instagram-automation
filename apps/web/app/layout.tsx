import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { SidebarUserCard } from "@/components/shell/user-profile";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AutoChannel — AI Video Studio",
  description:
    "AI Video Studio: g'oya, ssenariy, o'zbekcha ovoz (TTS), dinamik subtitr va 9:16 HD video montaji.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uz"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="relative min-h-full bg-background text-text overflow-x-hidden">
        {/* Subtle Cinema Studio Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/4 h-[420px] w-[560px] rounded-full bg-primary/12 blur-[120px]" />
          <div className="absolute top-1/3 -right-32 h-[380px] w-[420px] rounded-full bg-accent-cyan/8 blur-[120px]" />
        </div>

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
