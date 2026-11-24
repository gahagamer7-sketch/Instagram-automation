"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  ArrowLeftRight,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  LogOut,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  Info,
  Layers,
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
      aria-hidden="true"
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
}: InstagramConnectModalProps) {
  const [loadingMode, setLoadingMode] = useState<"instagram" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showHowToSwitch, setShowHowToSwitch] = useState(false);
  const [showFacebookOption, setShowFacebookOption] = useState(false);

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

  // Rasmiy Meta Unified Login (Facebook Login for Business config_id bilan)
  const handleOpenInstagramOAuth = () => {
    setError(null);
    setLoadingMode("instagram");

    const width = 580;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/instagram/login?popup=1",
      "instagram_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`,
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setLoadingMode(null);
      setError("Brauzer qalqib chiquvchi oynani blokladi. Iltimos, ushbu sayt uchun ruxsat bering.");
    }
  };

  // Muqobil: Facebook Page orqali bog'lash (Meta OAuth)
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
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#121318] p-6 sm:p-7 text-white shadow-2xl shadow-black/90 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          aria-label="Yopish"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center justify-center gap-3 pt-2 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md">
            <span className="font-black text-white text-xl tracking-tighter">AC</span>
          </div>

          <ArrowLeftRight className="h-4 w-4 text-neutral-400" />

          {/* Instagram Gradient Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-lg shadow-pink-500/20 p-2.5">
            <InstagramIcon className="w-full h-full text-white" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center mt-3 mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {isConnected ? "Instagram Akkaunti Ulangan" : "Connect Instagram"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {isConnected
              ? "Reels avtomatik nashr qilish va kontent rejalashtirish uchun faol"
              : "AI orqali Reels yaratish, nashr qilish va analitika uchun Instagram akkauntingizni ulang"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-200 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-medium">{error}</p>
              {error.toLowerCase().includes("business.facebook.com") && (
                <p className="text-[11px] text-red-300/80">
                  Eslatma: Agar Meta sizni Business Suite sahifasiga yo&apos;naltirsa, Meta Dashboard&apos;dagi konfiguratsiyada faqat Instagram ruxsatlari saqlanganligini tekshiring.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STATE A: ALREADY CONNECTED ACCOUNT VIEW */}
        {isConnected ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/15 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  {connectedAccount?.profilePictureUrl ? (
                    <Image
                      src={connectedAccount.profilePictureUrl}
                      alt={connectedAccount.handle || "Instagram"}
                      width={48}
                      height={48}
                      unoptimized
                      className="rounded-full object-cover ring-2 ring-emerald-500/50"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-sm ring-2 ring-emerald-500/50">
                      {connectedAccount?.handle?.charAt(0).toUpperCase() || "I"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 block h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-[#121318]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      @{connectedAccount?.handle}
                    </span>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/20">
                      Ulangan (Active)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
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

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="gradient"
                onClick={onClose}
                className="flex-1 h-11 text-xs font-semibold gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Davom etish</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isDisconnecting}
                onClick={handleDisconnect}
                className="h-11 px-4 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>Akkauntni uzish</span>
              </Button>
            </div>
          </div>
        ) : (
          /* STATE B: OPUSCLIP-STYLE GUIDED CONNECTION EXPERIENCE */
          <div className="space-y-5">
            {/* 1. Requirements Card (Business / Creator Account) */}
            <div className="rounded-2xl border border-white/10 bg-[#17181f] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 mt-0.5">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-white">
                    Professional (Creator yoki Business) hisob talab qilinadi
                  </div>
                  <p className="text-neutral-400 mt-1 leading-relaxed">
                    Meta rasmiy Graph API siyosatiga muvofiq, oddiy shaxsiy (Personal) profillar avtomatlashtirishni qo&apos;llab-quvvatlamaydi. Akkauntingiz Professional (Creator yoki Business) holatida bo&apos;lishi kerak.
                  </p>
                </div>
              </div>

              {/* How to switch dropdown */}
              <div className="pt-1 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowHowToSwitch(!showHowToSwitch)}
                  className="flex items-center justify-between w-full text-[11px] font-medium text-pink-400 hover:text-pink-300 transition py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Shaxsiy akkauntni Professionalga qanday o&apos;tkazish mumkin? (1 daqiqa)
                  </span>
                  <span className="text-[10px] underline">
                    {showHowToSwitch ? "Yashirish" : "Ko'rish"}
                  </span>
                </button>

                {showHowToSwitch && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#0f1015] border border-white/5 text-[11px] text-neutral-300 space-y-2 animate-in fade-in duration-150">
                    <p className="font-medium text-white">Instagram mobil ilovasida:</p>
                    <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                      <li>Profil sahifangizga o&apos;ting va <b>Edit profile</b> tugmasini bosing.</li>
                      <li>Pastga tushib, <b>Switch to professional account</b> ni tanlang.</li>
                      <li><b>Creator</b> yoki <b>Business</b> toifasini tanlang (mutlaqo bepul).</li>
                    </ol>
                    <p className="text-[10px] text-emerald-400 pt-1">
                      ✓ Ushbu o&apos;zgartirish postlaringizga ta&apos;sir qilmaydi va xohlagan vaqt qaytarish mumkin.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Requested Permissions Overview */}
            <div className="rounded-2xl border border-white/10 bg-[#17181f] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>So&apos;raladigan rasmiy Meta ruxsatlari:</span>
              </div>
              <ul className="grid grid-cols-1 gap-2 text-[11px] text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span><b>Reels nashr qilish</b> — tayyorlangan videolarni to&apos;g&apos;ridan-to&apos;g&apos;ri chiqarish</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span><b>Profil ma&apos;lumotlari va ko&apos;rishlar</b> — obunachilar va qamrov analitikasi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span><b>Izohlar va xabarlar</b> — auditoriya bilan aloqani avtomatlashtirish</span>
                </li>
              </ul>
            </div>

            {/* 3. Primary Hero Action: Continue with Instagram */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={loadingMode !== null}
                onClick={handleOpenInstagramOAuth}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2.5 text-sm shadow-xl shadow-pink-500/25 disabled:opacity-50"
              >
                {loadingMode === "instagram" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Meta oynasi ochilmoqda...</span>
                  </>
                ) : (
                  <>
                    <InstagramIcon className="h-5 w-5" />
                    <span className="tracking-wide">Continue with Instagram</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Rasmiy Meta OAuth 2.0. Shaxsiy parollaringiz so&apos;ralmaydi va olinmaydi.</span>
              </div>
            </div>

            {/* 4. Alternative Method: Connect through Facebook Page */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowFacebookOption(!showFacebookOption)}
                className="flex items-center justify-between w-full text-[11px] font-medium text-neutral-400 hover:text-white transition py-1"
              >
                <span>Instagram akkauntingiz Facebook sahifaga bog&apos;langanmi?</span>
                <span className="text-[10px] text-cyan-400 underline">
                  {showFacebookOption ? "Yashirish" : "Facebook orqali ulash"}
                </span>
              </button>

              {showFacebookOption && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#17181f] border border-white/5 space-y-2 animate-in fade-in duration-150">
                  <p className="text-[11px] text-neutral-400">
                    Agar Instagram hisobingiz Facebook sahifangizga biriktirilgan bo&apos;lsa, standart Facebook Login orqali ham ruxsat berishingiz mumkin:
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={loadingMode !== null}
                    onClick={handleOpenFacebookPopup}
                    className="w-full text-xs h-9 gap-2 justify-center"
                  >
                    <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Connect Instagram through Facebook</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
