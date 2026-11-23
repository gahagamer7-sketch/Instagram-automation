"use client";

import { useEffect, useState } from "react";
import {
  X,
  ArrowLeftRight,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  User,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectInstagramDirectAction } from "@/app/onboarding/actions";

export interface InstagramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { handle: string; igUserId: string }) => void;
  onSmartConnect?: (handle: string) => Promise<void>;
  isSmartConnecting?: boolean;
}

export function InstagramConnectModal({
  isOpen,
  onClose,
  onSuccess,
  onSmartConnect,
  isSmartConnecting,
}: InstagramConnectModalProps) {
  // Direct Instagram login form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallbacks & popup states
  const [loadingMode, setLoadingMode] = useState<"facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [smartHandle, setSmartHandle] = useState("");

  // Listen to popup postMessage events (if user chooses Facebook/Meta OAuth)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "INSTAGRAM_CONNECTED") {
        setLoadingMode(null);
        setError(null);
        onSuccess({
          handle: event.data.handle || "instagram_user",
          igUserId: event.data.igUserId || "",
        });
        onClose();
      } else if (event.data.type === "INSTAGRAM_ERROR") {
        setLoadingMode(null);
        setError(event.data.message || event.data.error || "Ulanish bekor qilindi yoki xatolik yuz berdi");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onClose]);

  if (!isOpen) return null;

  // Direct login submit handler
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().replace(/^@+/, "");
    if (!cleanUser || cleanUser.length < 2) {
      setError("Iltimos, Instagram foydalanuvchi nomingizni (yoki telefon/email) kiriting.");
      return;
    }

    if (!password || password.length < 4) {
      setError("Iltimos, Instagram parolingizni kiriting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await connectInstagramDirectAction({
        username: cleanUser,
        password,
      });

      if (res.ok && res.handle) {
        onSuccess({
          handle: res.handle,
          igUserId: res.igUserId || `ig_${Date.now()}`,
        });
        onClose();
      } else {
        setError(res.message || "Instagram akkauntiga ulanishda xatolik yuz berdi.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Ulanishda xato: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFacebookPopup = () => {
    setError(null);
    setLoadingMode("facebook");

    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/meta/login?from=/onboarding?step=4",
      "meta_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setLoadingMode(null);
      setError("Brauzer popup oynasini blokladi. Iltimos, qalqib chiquvchi oynalarga ruxsat bering.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#121318] p-6 text-white shadow-2xl shadow-black/90 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icons (AutoChannel <-> Instagram) */}
        <div className="flex items-center justify-center gap-3 pt-1 pb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
            <span className="font-black text-white text-lg tracking-tighter">AC</span>
          </div>

          <ArrowLeftRight className="h-4 w-4 text-neutral-400" />

          {/* Instagram Icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md p-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
        </div>

        {/* Modal Title */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Instagram orqali to&apos;g&apos;ridan-to&apos;g&apos;ri kirish
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Instagram login va parolingiz orqali to&apos;g&apos;ridan-to&apos;g&apos;ri bog&apos;lang. Facebook yoki Portfolio talab etilmaydi.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* 1-YECHIM: Direct Instagram Login Form */}
        <form onSubmit={handleDirectLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-300 mb-1.5">
              Instagram foydalanuvchi nomi, telefon yoki email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="feyderik_67 yoki @username"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-[#191a22] pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-300 mb-1.5">
              Instagram paroli
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-[#191a22] pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 flex items-center gap-2 text-[11px] text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>AES-256 xavfsiz shifrlash: Ma&apos;lumotlaringiz to&apos;liq himoyalangan holda saqlanadi.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !username.trim() || !password.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-semibold hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Instagram akkauntiga ulanmoqda...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Instagram bilan kirish va bog&apos;lash</span>
              </>
            )}
          </button>
        </form>

        {/* Advanced Options Accordion */}
        <div className="mt-5 border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] font-medium text-neutral-400 hover:text-white transition flex items-center justify-between w-full py-1"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Boshqa ulanish usullari (Facebook yoki Faqat @nik)
            </span>
            <span className="text-[10px] text-cyan-400 hover:underline">
              {showAdvanced ? "Yashirish" : "Ko'rsatish"}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
              {/* Option A: Facebook Popup */}
              <button
                type="button"
                onClick={handleOpenFacebookPopup}
                disabled={loadingMode !== null || isSubmitting}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-[#17181f] hover:border-white/15 transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1877F2] text-white">
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white group-hover:text-cyan-400 transition">
                      Facebook orqali bog&apos;lash (Meta OAuth)
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Facebook sahifangiz orqali rasmiy Meta ruxsati
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-white transition" />
              </button>

              {/* Option B: Fast Smart Connect (No password) */}
              <div className="rounded-xl border border-white/5 bg-[#17181f] p-3 space-y-2">
                <div className="text-[11px] font-medium text-neutral-300">
                  Parolsiz test rejimi (@username orqali)
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={smartHandle}
                    onChange={(e) => setSmartHandle(e.target.value)}
                    placeholder="@sizning_kanalingiz"
                    className="flex-1 rounded-lg border border-white/10 bg-[#0f1015] px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="gradient"
                    disabled={isSmartConnecting || !smartHandle.trim()}
                    onClick={() => {
                      if (onSmartConnect && smartHandle.trim()) {
                        onSmartConnect(smartHandle.trim());
                      }
                    }}
                    className="text-xs h-8 px-2.5 gap-1 shrink-0"
                  >
                    {isSmartConnecting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    <span>Bog&apos;lash</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
