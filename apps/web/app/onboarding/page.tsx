import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import { OnboardingWizard, type OnboardingState } from "@/components/onboarding/onboarding-wizard";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Tizimni ishga tushirish (Onboarding) — AutoChannel",
  description: "5 bosqichli sozlash: API kalitlar, nisha, brend, Instagram ulash va avtomatik rejim (TZ 4.11).",
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
  const currentUser = await getCurrentUser();
  const userChannel = currentUser?.channel;

  const [geminiCred, channel, settings] = await Promise.all([
    prisma.apiCredential.findUnique({ where: { provider: "gemini" } }),
    userChannel
      ? prisma.channel.findUnique({
          where: { id: userChannel.id },
          include: { brandKit: true, oauthToken: true },
        })
      : null,
    prisma.appSetting.findFirst(),
  ]);

  const hasInstagram = Boolean(
    channel?.igUserId &&
    channel.status === "active" &&
    (channel.oauthToken?.accessToken || channel.igUserId),
  );

  const state: OnboardingState = {
    hasGeminiKey: Boolean(geminiCred && geminiCred.status === "connected"),
    hasNiche: Boolean(channel?.niche),
    nicheName: channel?.niche ?? null,
    hasBrand: Boolean(channel?.brandKitId),
    brandName: channel?.brandKit?.chosenName ?? channel?.name ?? null,
    hasInstagram,
    igUserId: channel?.igUserId ?? null,
    isOnboarded: Boolean(settings?.onboardedAt && hasInstagram),
  };

  return <OnboardingWizard initial={state} />;
}
