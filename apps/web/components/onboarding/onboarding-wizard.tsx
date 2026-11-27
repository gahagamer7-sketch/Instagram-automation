"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Rocket,
  CheckCircle2,
  KeyRound,
  Compass,
  Palette,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Clapperboard,
} from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { finishOnboardingAction } from "@/app/onboarding/actions";
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
  isOnboarded: boolean;
}

export function OnboardingWizard({ initial }: { initial: OnboardingState }) {
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (!initial.hasGeminiKey) return 1;
    if (!initial.hasNiche) return 2;
    if (!initial.hasBrand) return 3;
    return 4;
  });

  const [isFinishing, startFinishing] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const s = Number(stepParam);
      if (!Number.isNaN(s) && s >= 1 && s <= 4) {
        setCurrentStep(s);
      }
    }
  }, [searchParams]);

  const steps = [
    { num: 1, label: "API Kalitlar", done: initial.hasGeminiKey, icon: KeyRound },
    { num: 2, label: "Nisha", done: initial.hasNiche, icon: Compass },
    { num: 3, label: "Brend", done: initial.hasBrand, icon: Palette },
    { num: 4, label: "Studiyani ochish", done: initial.isOnboarded, icon: Rocket },
  ];

  const handleFinish = () => {
    setFeedback(null);
    startFinishing(async () => {
      const res = await finishOnboardingAction();
      if (res.ok) {
        setFeedback({ tone: "success", message: res.message });
        setTimeout(() => {
          window.location.href = "/reels/create";
        }, 900);
      } else {
        setFeedback({ tone: "danger", message: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 4-Bosqichli Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((s) => {
          const isCurrent = currentStep === s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
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
              <h3 className="font-bold text-text text-lg">1-Qadam: Shaxsiy AI Kalitlarni Sozlash</h3>
              <p className="text-xs text-muted mt-1">
                Har bir foydalanuvchi o&apos;zining shaxsiy Gemini (ovoz va matn) va Groq (tezkor ssenariy) kalitini kiritadi.
              </p>
            </div>
            <KeyRound className="h-6 w-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge tone={initial.hasGeminiKey ? "success" : "warning"}>
                {initial.hasGeminiKey ? "Ulangan" : "Ulanmagan"}
              </Badge>
              <span className="text-xs text-text font-medium">
                Gemini va Groq API kalitlari (Sozlamalar bo&apos;limi)
              </span>
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
              <h3 className="font-bold text-text text-lg">2-Qadam: Video Nishasini Tanlash</h3>
              <p className="text-xs text-muted mt-1">
                AI yordamida eng yuqori talabga ega kontent yo&apos;nalishingizni tanlang.
              </p>
            </div>
            <Compass className="h-6 w-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Tanlangan nisha</p>
              <p className="text-xs text-muted mt-0.5">
                {initial.nicheName ? initial.nicheName : "Hali nisha tanlanmagan (ixtiyoriy)"}
              </p>
            </div>
            {initial.hasNiche ? (
              <Badge tone="success">{initial.nicheName}</Badge>
            ) : (
              <Link
                href="/niche"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Nisha tanlashga o&apos;tish
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
              <h3 className="font-bold text-text text-lg">3-Qadam: Brend Uslubi</h3>
              <p className="text-xs text-muted mt-1">
                Videolaringizdagi muallif nomi, rang palitrasi va vizual uslubni sozlang.
              </p>
            </div>
            <Palette className="h-6 w-6 text-primary" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Brend holati</p>
              <p className="text-xs text-muted mt-0.5">
                {initial.brandName ? `Brend: ${initial.brandName}` : "Brend uslubi sozlanmagan (ixtiyoriy)"}
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
              Keyingi qadam (Studiyani ochish)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* 4-QADAM: Video Studiyani Ishga Tushirish */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-text text-lg">4-Qadam: AI Video Studio Tayyor</h3>
              <p className="text-xs text-muted mt-1">
                Sozlamalar yakunlandi. Endi studiyada g&apos;oya yozib, bir tugma bilan 9:16 video yaratishingiz mumkin.
              </p>
            </div>
            <Clapperboard className="h-6 w-6 text-success" />
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-2 space-y-2 text-xs">
            <div className="font-semibold text-text text-sm flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Studiyada video yaratish tartibi:
            </div>
            <p>1. Mavzu yoki g&apos;oya kiritasiz (yoki AI trend g&apos;oyalardan tanlaysiz).</p>
            <p>2. Groq AI yoki Gemini 2.0 Flash ssenariy va kuchli hook yozib beradi.</p>
            <p>3. Gemini TTS o&apos;zbek tilida tabiiy diktor ovozini sintez qiladi.</p>
            <p>4. FFmpeg 1080x1920 9:16 formatda dinamik subtitrli video montaj qiladi.</p>
            <p>5. Tayyor MP4 video va muqovani (cover) kompyuterga yuklab olasiz.</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Barcha API kalitlaringiz shaxsiy hisobingizda AES-256-GCM bilan himoyalangan.</span>
            </div>
            <Badge tone={initial.isOnboarded ? "success" : "neutral"}>
              {initial.isOnboarded ? "Tayyor" : "Sozlash"}
            </Badge>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setCurrentStep(3)}>
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
              {isFinishing ? "Ochilmoqda..." : "Video Studiyani Ochish"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
