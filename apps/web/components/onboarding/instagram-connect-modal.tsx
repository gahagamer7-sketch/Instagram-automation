"use client";

import { useEffect, useState } from "react";
import { X, ArrowLeftRight, Check, AlertCircle, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [loadingMode, setLoadingMode] = useState<"instagram" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSmartFallback, setShowSmartFallback] = useState(false);
  const [smartHandle, setSmartHandle] = useState("");

  // Listen to popup postMessage events
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
        if (event.data.error === "missing_app_id") {
          setError(
            "Meta Developer App hali Vercel'da sozlanmagan. Iltimos, pastdagi 'Tezkor ulanish' orqali davom eting yoki Meta App ID kiriting.",
          );
          setShowSmartFallback(true);
        } else {
          setError(event.data.message || event.data.error || "Ulanish bekor qilindi yoki xatolik yuz berdi");
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onClose]);

  if (!isOpen) return null;

  const handleOpenInstagramPopup = () => {
    setError(null);
    setLoadingMode("instagram");

    const width = 560;
    const height = 720;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/instagram/login?popup=1",
      "instagram_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setLoadingMode(null);
      setError("Brauzer popup oynasini blokladi. Iltimos, ushbu sayt uchun qalqib chiquvchi oynalarga ruxsat bering.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14151a] p-6 text-white shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icons (AutoChannel <-> Instagram) - Opus Clip Style */}
        <div className="flex items-center justify-center gap-3 pt-2 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
            <span className="font-black text-white text-xl tracking-tighter">AC</span>
          </div>

          <ArrowLeftRight className="h-4 w-4 text-neutral-400" />

          {/* Instagram Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md p-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
        </div>

        {/* Modal Titles */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Instagram akkauntingizni qanday ulamoqchisiz?
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Akkauntni to&apos;g&apos;ridan-to&apos;g&apos;ri Instagram yoki Facebook orqali bog&apos;lashingiz mumkin.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Main Card: Professional (Business & Creator) — Opus Clip Style */}
        <div className="rounded-2xl border border-white/10 bg-[#1c1d24] p-5 mb-4">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">
                Professional (Business & Creator)
              </h3>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                Tavsiya etiladi
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Business va Creator akkauntlari AutoChannel orqali avtomatik Reels chiqarish va post rejalashtirishni to&apos;liq qo&apos;llab-quvvatlaydi.
            </p>
          </div>

          <Button
            type="button"
            disabled={loadingMode !== null}
            onClick={handleOpenInstagramPopup}
            className="w-full h-11 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-white/5"
          >
            {loadingMode === "instagram" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                <span>Instagram oynasi ochilmoqda...</span>
              </>
            ) : (
              <span>Connect to Instagram</span>
            )}
          </Button>
        </div>

        {/* Alternative: Connect Instagram through Facebook — Opus Clip Style */}
        <div className="rounded-xl border border-white/5 bg-[#17181f] p-4 mb-4 hover:border-white/15 transition">
          <button
            type="button"
            onClick={handleOpenFacebookPopup}
            disabled={loadingMode !== null}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              {/* Facebook Logo */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1877F2] text-white">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-cyan-400 transition underline-offset-2">
                  Connect Instagram through Facebook
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Instagram akkauntingiz Facebook sahifangizga bog&apos;langan bo&apos;lishi kerak.
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-white transition" />
          </button>
        </div>

        {/* Smart Connect Fallback (Instant Testing Mode) */}
        <div className="border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={() => setShowSmartFallback(!showSmartFallback)}
            className="text-[11px] font-medium text-neutral-400 hover:text-white transition flex items-center justify-between w-full"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Meta App ochmaganmisiz? Test rejimi: Akkauntni darhol ulash
            </span>
            <span className="text-[10px] text-cyan-400 hover:underline">
              {showSmartFallback ? "Yashirish" : "Ko'rsatish"}
            </span>
          </button>

          {showSmartFallback && (
            <div className="mt-3 rounded-xl border border-white/5 bg-[#17181f] p-3 space-y-2.5 animate-in fade-in duration-150">
              <p className="text-[11px] text-neutral-400">
                Instagram username (@handle) kiriting. Tizim siz uchun profilingizni faollashtirib, videolarni rejalashtirishga ruxsat beradi:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={smartHandle}
                  onChange={(e) => setSmartHandle(e.target.value)}
                  placeholder="@feyderik_67"
                  className="flex-1 rounded-lg border border-white/10 bg-[#0f1015] px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-cyan-500 focus:outline-none"
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
                  className="text-xs h-9 px-3 gap-1.5 shrink-0"
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
          )}
        </div>
      </div>
    </div>
  );
}
