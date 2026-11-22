import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import { OnboardingWizard, type OnboardingState } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Onboarding — AutoChannel",
};

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Tizimni ishga tushirish (Onboarding)"
        description="5 bosqichli sozlash: API kalitlar, nisha, brend, Instagram ulash va avtomatik rejim (TZ 4.11)."
      />

      <Suspense fallback={<CardSkeleton lines={6} />}>
        <OnboardingContent />
      </Suspense>
    </>
  );
}

async function OnboardingContent() {
  const [geminiCred, channel, settings] = await Promise.all([
    prisma.apiCredential.findUnique({ where: { provider: "gemini" } }),
    prisma.channel.findFirst({
      include: { brandKit: true, oauthToken: true },
    }),
    prisma.appSetting.findFirst(),
  ]);

  const state: OnboardingState = {
    hasGeminiKey: Boolean(geminiCred && geminiCred.status === "connected"),
    hasNiche: Boolean(channel?.niche),
    nicheName: channel?.niche ?? null,
    hasBrand: Boolean(channel?.brandKitId),
    brandName: channel?.brandKit?.chosenName ?? channel?.name ?? null,
    hasInstagram: Boolean(channel?.igUserId && channel?.oauthToken?.accessToken),
    igUserId: channel?.igUserId ?? null,
    isOnboarded: Boolean(settings?.onboardedAt),
  };

  return <OnboardingWizard initial={state} />;
}

