"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = !rawFrom || rawFrom === "/" ? "/dashboard" : rawFrom;

  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const handleAdminAutofill = () => {
    setEmailValue("admin@autochannel.local");
    setPasswordValue("admin");
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-[0_8px_24px_rgba(124,58,237,0.4)] text-white">
          <Sparkles className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-text">Tizimga kirish</h1>
        <p className="mt-1.5 text-xs text-muted">
          AI Video Studio shaxsiy ish maydoningizga kirish
        </p>
      </div>

      <div className="card p-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="from" value={from} />

          {state && !state.ok && state.message && (
            <Alert tone="danger">{state.message}</Alert>
          )}

          {/* Elektron pochta */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-text"
              >
                Elektron pochta
              </label>
              <button
                type="button"
                onClick={handleAdminAutofill}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
                title="Admin orqali tezkor kirish"
              >
                <KeyRound className="h-3 w-3" />
                <span>Admin bilan to&apos;ldirish</span>
              </button>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                name="email"
                type="text"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="aziz@misol.uz yoki admin"
                className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-muted/60 transition focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Parol */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-text"
            >
              Parol
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                required
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
                <span>Boshqaruv paneliga kirish</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-5 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted">
            Hisobingiz yo&apos;qmi?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <UserPlus className="h-3.5 w-3.5 inline" />
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </div>

        <div className="mt-4 border-t border-border/60 pt-3 flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>Xavfsiz HTTP-only sessiya</span>
          </div>
          <Link
            href="/"
            className="text-primary hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Bosh sahifaga</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
