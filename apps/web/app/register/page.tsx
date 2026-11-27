import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish — AutoChannel",
  description: "AutoChannel AI Video Studio'da shaxsiy hisobingizni oching va professional qisqa videolar yarating.",
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* Orqa fon effektlari */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[450px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/15 via-indigo-500/10 to-transparent blur-3xl"
        aria-hidden
      />

      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-md space-y-4">
            <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}

