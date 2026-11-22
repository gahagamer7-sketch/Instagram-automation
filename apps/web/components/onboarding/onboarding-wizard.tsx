"use client";

import Link from "next/link";
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
} from "lucide-react";
import { useState, useTransition } from "react";
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
  const [isConnecting, startConnecting] = useTransition();
  const [isFinishing, startFinishing] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [isIgConnected, setIsIgConnected] = useState(initial.hasInstagram);

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
        handle: handle.replace(/^@/, ""),
      });
      if (res.ok) {
        setIsIgConnected(true);
        setFeedback({ tone: "success", message: res.message });
        setCurrentStep(5);
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
        window.location.href = "/";
      } else {
        setFeedback({ tone: "danger", message: res.message });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Qadamlar Navigatsiyasi */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((st) => {
          const Icon = st.icon;
          const isActive = currentStep === st.num;
          return (
            <button
              key={st.num}
              type="button"
              onClick={() => setCurrentStep(st.num)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                isActive
                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                  : st.done
                    ? "border-success/40 bg-success/5 text-success"
                    : "border-border bg-surface text-muted hover:border-border-hover"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="nums text-[11px] font-bold">0{st.num}</span>
                {st.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted"}`} />
                )}
              </div>
              <span className="text-xs font-semibold truncate text-text">{st.label}</span>
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
              <h3 className="font-bold text-text text-lg">1-Qadam: AI Kalitlarini Sozlash</h3>
              <p className="text-xs text-muted mt-1">
                Ssenariy, o'zbekcha TTS ovoz va tahlil uchun Gemini API kaliti kerak bo'ladi.
              </p>
            </div>
            <KeyRound className="h-6 w-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`h-5 w-5 ${initial.hasGeminiKey ? "text-success" : "text-muted"}`} />
              <div>
                <p className="text-sm font-semibold text-text">Gemini API Kaliti</p>
                <p className="text-xs text-muted">
                  {initial.hasGeminiKey ? "Ulandi va tekshirildi" : "Kiritilmagan"}
                </p>
              </div>
            </div>
            {initial.hasGeminiKey ? (
              <Badge tone="success">Ulangan</Badge>
            ) : (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Sozlamalarda kiritish
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
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
                Nisha kashfiyotchisiga o'tish
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
                Brend studiyasiga o'tish
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

      {/* 4-QADAM: Instagram Business Ulash */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text text-lg">4-Qadam: Instagram Business Akkauntni Ulash</h3>
              <p className="text-xs text-muted mt-1">
                Reels videolarni Graph API orqali avtomatik joylash uchun Meta Access Token va Instagram User ID talab qilinadi (TZ 4.6).
              </p>
            </div>
            <Share2 className="h-6 w-6 text-primary" />
          </div>

          {isIgConnected ? (
            <div className="p-4 rounded-xl border border-success/40 bg-success/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Instagram akkauntingiz muvaffaqiyatli ulangan!
              </div>
              <Button size="sm" variant="secondary" onClick={() => setIsIgConnected(false)}>
                Qayta sozlash
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-surface-2 text-xs text-muted space-y-1.5">
                <div className="font-semibold text-text text-sm mb-1 flex items-center gap-1.5">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Qanday ulanadi?
                </div>
                <p>1. Instagram akkauntingizni <strong>Business / Creator</strong> turiga o'tkazing.</p>
                <p>2. Akkauntni Facebook Page sahifasiga ulang.</p>
                <p>3. Meta for Developers'da <strong>Graph API Explorer</strong> orqali <code>instagram_content_publish</code> huquqiga ega Access Token oling.</p>
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

      {/* 5-QADAM: Ishga Tushirish */}
      {currentStep === 5 && (
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl gradient-brand text-white mx-auto flex items-center justify-center shadow-lg shadow-primary/30">
            <Rocket className="h-8 w-8 animate-bounce" />
          </div>

          <div>
            <h3 className="font-bold text-text text-2xl">Barcha qadamlar muvaffaqiyatli bajarildi!</h3>
            <p className="text-sm text-muted mt-1.5 max-w-md mx-auto">
              AutoChannel tizimi endi har kuni belgilangan vaqtda (19:00 UTC+5) to'liq avtomatik tarzda Reels tayyorlaydi va joylaydi.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto text-left text-xs">
            <div className="p-3 rounded-xl border border-border bg-surface-2">
              <span className="text-muted block text-[11px]">Nisha:</span>
              <span className="font-semibold text-text truncate block mt-0.5">
                {initial.nicheName || "Faol"}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface-2">
              <span className="text-muted block text-[11px]">Brend:</span>
              <span className="font-semibold text-text truncate block mt-0.5">
                {initial.brandName || "AutoChannel"}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface-2">
              <span className="text-muted block text-[11px]">Rejim:</span>
              <span className="font-semibold text-success block mt-0.5">Avtomatik</span>
            </div>
            <div className="p-3 rounded-xl border border-border bg-surface-2">
              <span className="text-muted block text-[11px]">Jadval:</span>
              <span className="font-semibold text-text block mt-0.5">19:00 (UTC+5)</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              variant="gradient"
              disabled={isFinishing}
              onClick={handleFinish}
              className="gap-2 px-6 py-2.5 text-base"
            >
              <Sparkles className="h-5 w-5" />
              {isFinishing ? "Yoqilmoqda..." : "Avtomatik rejimni yoqish va boshqaruv paneliga o'tish"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

