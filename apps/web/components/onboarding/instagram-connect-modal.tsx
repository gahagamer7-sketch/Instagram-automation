"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  ArrowLeftRight,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConnectedInstagramAccount {
  handle?: string;
  igUserId?: string;
  profilePictureUrl?: string;
  accountType?: string;
}

export interface InstagramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: {
    handle: string;
    igUserId: string;
    profilePictureUrl?: string;
    accountType?: string;
  }) => void;
  connectedAccount?: ConnectedInstagramAccount | null;
  onDisconnect?: () => Promise<void>;
  onSmartConnect?: (handle: string) => Promise<void>;
  isSmartConnecting?: boolean;
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function InstagramConnectModal({
  isOpen,
  onClose,
  onSuccess,
  connectedAccount,
  onDisconnect,
  onSmartConnect,
  isSmartConnecting,
}: InstagramConnectModalProps) {
  const [loadingMode, setLoadingMode] = useState<"instagram" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [smartHandle, setSmartHandle] = useState("");

  // Listen for popup postMessage events
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "INSTAGRAM_CONNECTED") {
        setLoadingMode(null);
        setError(null);
        onSuccess({
          handle: event.data.handle || "instagram_user",
          igUserId: event.data.igUserId || "",
          profilePictureUrl: event.data.profilePictureUrl,
          accountType: event.data.accountType,
        });
      } else if (event.data.type === "INSTAGRAM_ERROR") {
        setLoadingMode(null);
        setError(
          event.data.message ||
            event.data.error ||
            "Instagram avtorizatsiyasi bekor qilindi yoki xatolik yuz berdi",
        );
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  if (!isOpen) return null;

  // Rasmiy native Instagram OAuth popup
  const handleOpenInstagramOAuth = () => {
    setError(null);
    setLoadingMode("instagram");

    const width = 560;
    const height = 740;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/instagram/login?popup=1",
      "instagram_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setLoadingMode(null);
      setError("Brauzer qalqib chiquvchi oynani blokladi. Iltimos, bu sayt uchun ruxsat bering.");
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
      setError("Brauzer popup oynasini blokladi.");
    }
  };

  const handleDisconnect = async () => {
    if (!onDisconnect) return;
    setIsDisconnecting(true);
    setError(null);
    try {
      await onDisconnect();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Akkauntni uzishda xato: ${msg}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = Boolean(connectedAccount?.handle || connectedAccount?.igUserId);

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
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center justify-center gap-3 pt-1 pb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
            <span className="font-black text-white text-lg tracking-tighter">AC</span>
          </div>

          <ArrowLeftRight className="h-4 w-4 text-neutral-400" />

          {/* Instagram Gradient Logo */}
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md p-2">
            <InstagramIcon className="w-full h-full text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {isConnected ? "Instagram Akkaunti Ulangan" : "Connect Instagram"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isConnected
              ? "Reels avtomatik nashr qilish va kontent rejalashtirish uchun faol"
              : "Rasmiy Instagram OAuth orqali Professional (Creator / Business) akkauntingizni ulang"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-medium">{error}</p>
              {error.toLowerCase().includes("invalid platform app") && (
                <p className="text-[11px] text-red-300/80">
                  Maslahat: Meta App Dashboard &gt; Instagram &gt; &quot;API setup with Instagram login&quot; bo&apos;limidagi <b>Instagram App ID</b> dan foydalaning.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STATE A: ALREADY CONNECTED ACCOUNT VIEW */}
        {isConnected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/15 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {connectedAccount?.profilePictureUrl ? (
                    <Image
                      src={connectedAccount.profilePictureUrl}
                      alt={connectedAccount.handle || "Instagram"}
                      width={44}
                      height={44}
                      unoptimized
                      className="rounded-full object-cover ring-2 ring-emerald-500/50"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-sm ring-2 ring-emerald-500/50">
                      {connectedAccount?.handle?.charAt(0).toUpperCase() || "I"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#121318]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-sm">
                      @{connectedAccount?.handle}
                    </span>
                    <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                      Ulangan
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {connectedAccount?.accountType || "Professional (Creator / Business)"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Qayta avtorizatsiyadan o'tish"
                  onClick={handleOpenInstagramOAuth}
                  disabled={loadingMode !== null || isDisconnecting}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="gradient"
                onClick={onClose}
                className="flex-1 h-10 text-xs font-semibold gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Davom etish</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isDisconnecting}
                onClick={handleDisconnect}
                className="h-10 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
              >
                {isDisconnecting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>Akkauntni uzish</span>
              </Button>
            </div>
          </div>
        ) : (
          /* STATE B: OFFICIAL "CONTINUE WITH INSTAGRAM" FLOW */
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#181920] p-4 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg shadow-pink-500/20 p-2.5">
                <InstagramIcon className="w-full h-full" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">
                  Instagram API with Instagram Login
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Tugmani bosganda rasmiy Instagram rozilik oynasi ochiladi. Hech qanday Facebook sahifa talab etilmaydi.
                </p>
              </div>

              {/* HERO BUTTON: "Continue with Instagram" */}
              <button
                type="button"
                disabled={loadingMode !== null}
                onClick={handleOpenInstagramOAuth}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-semibold hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2.5 text-sm shadow-xl shadow-pink-500/25 disabled:opacity-50"
              >
                {loadingMode === "instagram" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Instagram oynasi ochilmoqda...</span>
                  </>
                ) : (
                  <>
                    <InstagramIcon className="h-5 w-5" />
                    <span className="font-bold tracking-wide">Continue with Instagram</span>
                  </>
                )}
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 flex items-center gap-2 text-[11px] text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Rasmiy OAuth 2.0: Tokenlar AES-256 bilan shifrlanadi. Shaxsiy parollaringiz olinmaydi.
              </span>
            </div>

            {/* Collapsible Alternative Options */}
            <div className="border-t border-white/5 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] font-medium text-neutral-400 hover:text-white transition flex items-center justify-between w-full py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  Boshqa ulanish usullari (Facebook sahifa yoki Test rejimi)
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
                    disabled={loadingMode !== null}
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
                          Facebook Login for Business (Meta OAuth)
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Facebook sahifangiz orqali bog&apos;lash
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-white transition" />
                  </button>

                  {/* Option B: Fast Smart Connect (Test handle) */}
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
        )}
      </div>
    </div>
  );
}
