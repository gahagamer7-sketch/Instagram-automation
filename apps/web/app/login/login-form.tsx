"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 shadow-[0_8px_24px_rgba(37,99,235,0.35)] text-white">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">AutoChannel Admin</h1>
        <p className="mt-1.5 text-xs text-muted">
          Reels avtomatlashtirish boshqaruv paneliga kirish (TZ 4.8)
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="from" value={from} />

          {state && !state.ok && state.message && (
            <Alert tone="danger">{state.message}</Alert>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-text"
            >
              Admin Paroli
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoFocus
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-10 py-2.5 text-sm text-text placeholder:text-muted/60 transition focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-text transition"
                aria-label={showPassword ? "Parolni berkitish" : "Parolni ko'rsatish"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted">
              .env faylida ko&apos;rsatilgan ADMIN_PASSWORD kaliti
            </p>
          </div>

          <Button
            type="submit"
            variant="gradient"
            disabled={isPending}
            className="w-full h-11 text-sm font-semibold gap-2 mt-2 shadow-md"
          >
            {isPending ? (
              <span>Tekshirilmoqda...</span>
            ) : (
              <>
                <span>Tizimga kirish</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-5 border-t border-border pt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>AES-256-GCM va xavfsiz HTTP-only sessiya</span>
        </div>
      </div>
    </div>
  );
}

