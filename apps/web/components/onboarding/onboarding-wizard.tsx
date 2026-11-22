"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Rocket,
  CheckCircle2,
  KeyRound,
  Compass,
  Palette,
  Share2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { connectInstagramAction, finishOnboardingAction } from "@/app/onboarding/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export interface OnboardingState {
  hasGeminiKey: boolean;
  hasNiche: boolean;
  nicheName: string | null;
  hasBrand: boolean;
  brandName: string | null;
  hasInstagram: boolean;
  igUserId: string | null;
  isOnboarded: boolean;
}

export function OnboardingWizard({ initial }: { initial: OnboardingState }) {
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (!initial.hasGeminiKey) return 1;
    if (!initial.hasNiche) return 2;
    if (!initial.hasBrand) return 3;
    if (!initial.hasInstagram) return 4;
    return 5;
  });

  // Step 4 form
  const [token, setToken] = useState("");
  const [igUserId, setIgUserId] = useState(initial.igUserId || "");
  const [handle, setHandle] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [isConnecting, startConnecting] = useTransition();
  const [isFinishing, startFinishing] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [isIgConnected, setIsIgConnected] = useState(initial.hasInstagram);

  useEffect(() => {
    const metaSuccess = searchParams.get("meta_success");
    const metaError = searchParams.get("meta_error");
    const stepParam = searchParams.get("step");
    const handleParam = searchParams.get("handle");

    if (stepParam) {
      const s = Number(stepParam);
      if (!Number.isNaN(s) && s >= 1 && s <= 5) {
        setCurrentStep(s);
      }
    }

    if (metaSuccess === "1") {
      setIsIgConnected(true);
      if (handleParam) setHandle(handleParam);
      setFeedback({
        tone: "success",
        message: `Instagram Business akkaunti (@${handleParam || "Instagram"}) muvaffaqiyatli ulandi!`,
      });
    } else if (metaError) {
      let msg = metaError;
      if (metaError === "missing_app_id") {
        msg =
          "META_APP_ID sozlanmagan. Iltimos .env faylida META_APP_ID va META_APP_SECRET kalitlarini kiriting yoki pastda qo'lda Access Token kiriting.";
      }
      setFeedback({ tone: "danger", message: msg });
    }
  }, [searchParams]);

  const steps = [
    { num: 1, label: "API Kalitlar", done: initial.hasGeminiKey, icon: KeyRound },
    { num: 2, label: "Nisha", done: initial.hasNiche, icon: Compass },
    { num: 3, label: "Brend", done: initial.hasBrand, icon: Palette },
    { num: 4, label: "Instagram", done: isIgConnected, icon: Share2 },
    { num: 5, label: "Ishga tushirish", done: initial.isOnboarded, icon: Rocket },
  ];

  const handleConnect = () => {
    setFeedback(null);
    startConnecting(async () => {
      const res = await connectInstagramAction({
        accessToken: token,
        igUserId,
        handle,
      });

      if (res.ok) {
        setIsIgConnected(true);
        setFeedback({ tone: "success", message: res.message });
      } else {
        setFeedback({ tone: "danger", message: res.message });
      }
    });
  };

  const handleFinish = () => {
    setFeedback(null);
    startFinishing(async () => {
      const res = await finishOnboardingAction();
      if (res.ok) {
        setFeedback({ tone: "success", message: res.message });
        setTimeout(() => {
          window.location.href = "/pipeline";
        }, 1500);
      } else {
        setFeedback({ tone: "danger", message: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 5-Bosqichli Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((s) => {
          const Icon = s.icon;
          const isCurrent = currentStep === s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                isCurrent
                  ? "border-primary bg-primary/10 shadow-sm"
                  : s.done
                    ? "border-success/30 bg-success/5 hover:border-success/50"
                    : "border-border bg-surface hover:border-muted/50"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  s.done
                    ? "bg-success text-white"
                    : isCurrent
                      ? "bg-primary text-white"
                      : "bg-surface-2 text-muted"
                }`}
              >
                {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-text truncate">
                  {s.label}
                </span>
                <span className="block text-[10px] text-muted truncate">
                  {s.done ? "Bajarildi" : isCurrent ? "Jarayonda" : "Kutilmoqda"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div>
          <Alert tone={feedback.tone}>{feedback.message}</Alert>
        </div>
      )}

      {/* 1-QADAM: API Kalitlar */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text text-lg">1-Qadam: AI Kalitlarni Sozlash</h3>
              <p className="text-xs text-muted mt-1">
                Gemini API kaliti ssenariy, matn tahlili va o&apos;zbekcha ovoz (TTS) uchun asosiy hisoblanadi.
              </p>
            </div>
            <KeyRound className="h-6 w-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge tone={initial.hasGeminiKey ? "success" : "warning"}>
                {initial.hasGeminiKey ? "Ulangan" : "Ulanmagan"}
              </Badge>
              <span className="text-xs text-text font-medium">Gemini API kaliti (Google AI Studio)</span>
            </div>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Sozlamalarga o&apos;tish
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="gradient"
              onClick={() => setCurrentStep(2)}
              className="gap-2"
            >
              Keyingi qadam (Nisha)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* 2-QADAM: Nisha */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text text-lg">2-Qadam: Viral Nishani Tanlash</h3>
              <p className="text-xs text-muted mt-1">
                YouTube va AI signallari asosida eng yuqori talabga ega nisha tanlanadi.
              </p>
            </div>
            <Compass className="h-6 w-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Tanlangan nisha</p>
              <p className="text-xs text-muted mt-0.5">
                {initial.nicheName ? initial.nicheName : "Hali nisha tanlanmagan"}
              </p>
            </div>
            {initial.hasNiche ? (
              <Badge tone="success">{initial.nicheName}</Badge>
            ) : (
              <Link
                href="/niche"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Nisha kashfiyotchisiga o&apos;tish
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setCurrentStep(1)}>
              Orqaga
            </Button>
            <Button variant="gradient" onClick={() => setCurrentStep(3)} className="gap-2">
              Keyingi qadam (Brend)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* 3-QADAM: Brend */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text text-lg">3-Qadam: Brend Paketi</h3>
              <p className="text-xs text-muted mt-1">
                Kanal nomi, slogan, bio va 1080x1080 vektorli avatar tayyorlandi.
              </p>
            </div>
            <Palette className="h-6 w-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Brend holati</p>
              <p className="text-xs text-muted mt-0.5">
                {initial.brandName ? `Kanal: ${initial.brandName}` : "Brend kiti tayyorlanmagan"}
              </p>
            </div>
            {initial.hasBrand ? (
              <Badge tone="success">Tayyor</Badge>
            ) : (
              <Link
                href="/brand"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Brend studiyasiga o&apos;tish
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setCurrentStep(2)}>
              Orqaga
            </Button>
            <Button variant="gradient" onClick={() => setCurrentStep(4)} className="gap-2">
              Keyingi qadam (Instagram)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* 4-QADAM: Instagram Business Ulash (OAuth 1-klik yoki Manual) */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text text-lg">4-Qadam: Instagram Business Akkauntni Ulash</h3>
              <p className="text-xs text-muted mt-1">
                Reels videolarni Graph API orqali avtomatik joylash uchun Meta OAuth yoki Access Token talab qilinadi (TZ 4.6).
              </p>
            </div>
            <Share2 className="h-6 w-6 text-primary" />
          </div>

          {isIgConnected ? (
            <div className="p-4 rounded-xl border border-success/40 bg-success/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 className="h-5 w-5" />
                <span>Instagram akkauntingiz muvaffaqiyatli ulangan! {handle ? `(@${handle})` : ""}</span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setIsIgConnected(false)}>
                Qayta sozlash
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Variant 1: Rasmiy Meta OAuth 1-bosqichli ulash */}
              <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text text-sm">
                      Meta orqali avtomatik ulash (1-bosqichda, tavsiya etiladi)
                    </h4>
                    <p className="text-xs text-muted mt-0.5">
                      Parol talab qilinmaydi. Rasmiy Meta dialog oynasi orqali 60 kunlik xavfsiz OAuth token olinadi.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="/api/auth/meta/login?from=/onboarding?step=4"
                    className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition px-5 py-2.5 text-sm gradient-brand text-white shadow-md hover:brightness-110"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Facebook / Instagram orqali ulash</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Variant 2: Qo'lda kiritish (Manual) */}
              <div className="border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setManualMode(!manualMode)}
                  className="text-xs font-semibold text-muted hover:text-text transition flex items-center gap-1.5"
                >
                  {manualMode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span>
                    {manualMode
                      ? "Qo'lda kiritishni yopish"
                      : "Qo'lda Meta Graph API Token kiritish (Ishlab chiquvchilar uchun)"}
                  </span>
                </button>

                {manualMode && (
                  <div className="mt-4 space-y-4 rounded-xl border border-border bg-surface-2 p-4">
                    <div className="text-xs text-muted space-y-1">
                      <div className="font-semibold text-text text-xs flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                        Qo&apos;lda ulanish bo&apos;yicha:
                      </div>
                      <p>1. Instagram akkauntingizni <strong>Business / Creator</strong> turiga o&apos;tkazing.</p>
                      <p>2. Akkauntni Facebook sahifasiga ulang.</p>
                      <p>3. Meta Graph API Explorer orqali <code>instagram_content_publish</code> huquqiga ega token oling.</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted block mb-1">
                        Meta Graph API Access Token *
                      </label>
                      <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="EAA..."
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted block mb-1">
                          Instagram Business User ID *
                        </label>
                        <input
                          type="text"
                          value={igUserId}
                          onChange={(e) => setIgUserId(e.target.value)}
                          placeholder="178414..."
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted block mb-1">
                          Instagram Handle (username)
                        </label>
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="@autochannel.uz"
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        disabled={isConnecting || !token.trim() || !igUserId.trim()}
                        onClick={handleConnect}
                        className="gap-2"
                      >
                        {isConnecting ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                        {isConnecting ? "Tekshirilmoqda..." : "Ulanishni tekshirish va saqlash"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setCurrentStep(3)}>
              Orqaga
            </Button>
            <Button
              variant="gradient"
              disabled={!isIgConnected}
              onClick={() => setCurrentStep(5)}
              className="gap-2"
            >
              Keyingi qadam (Ishga tushirish)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* 5-QADAM: Avtomatik rejimni yoqish */}
      {currentStep === 5 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text text-lg">5-Qadam: Avtomatik Rejimni Yoqish</h3>
              <p className="text-xs text-muted mt-1">
                Barcha bosqichlar tayyor. Endi kanalni to&apos;liq avtomatik rejimga o&apos;tkazishingiz mumkin.
              </p>
            </div>
            <Rocket className="h-6 w-6 text-success" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 space-y-2 text-xs">
            <div className="font-semibold text-text text-sm flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Tizim quyidagi tartibda ishlaydi:
            </div>
            <p>1. Har kuni avtomatik ravishda yangi dolzarb mavzular topiladi.</p>
            <p>2. AI ssenariy yozadi va Gemini TTS o&apos;zbek tilida ovoz beradi.</p>
            <p>3. FFmpeg orqali 1080x1920 9:16 formatida video va dinamik subtitrlar render qilinadi.</p>
            <p>4. Video QA tekshiruvidan o&apos;tgach, Instagram Reels sifatida e&apos;lon qilinadi.</p>
            <p>5. Har bir bosqich va natija bo&apos;yicha Telegram botingizga hisobot yuboriladi.</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Avto-pauza himoyasi yoqilgan (xatolik bo&apos;lsa to&apos;xtatiladi).</span>
            </div>
            <Badge tone={initial.isOnboarded ? "success" : "neutral"}>
              {initial.isOnboarded ? "Avto-rejim faol" : "Kutilmoqda"}
            </Badge>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setCurrentStep(4)}>
              Orqaga
            </Button>
            <Button
              variant="gradient"
              disabled={isFinishing}
              onClick={handleFinish}
              className="gap-2 h-11 px-6 shadow-lg shadow-primary/25"
            >
              {isFinishing ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {isFinishing ? "Faollashtirilmoqda..." : "Avtomatik rejimni yoqish va boshlash"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
