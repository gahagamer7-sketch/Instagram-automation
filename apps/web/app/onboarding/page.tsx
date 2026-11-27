import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import { OnboardingWizard, type OnboardingState } from "@/components/onboarding/onboarding-wizard";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Studiya sozlamasi — AutoChannel",
  description: "4 bosqichli studiya sozlamasi: shaxsiy API kalitlar, nisha, brend va ishga tushirish.",
};

export default function OnboardingPage() {
  return (
    <>
      <PageHeader
        title="Studiya sozlamasi"
        description="4 bosqichli sozlash: shaxsiy API kalitlar, nisha, brend va AI Video Studiyani ochish."
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
    currentUser?.user?.id
      ? prisma.apiCredential.findUnique({
          where: {
            userId_provider: {
              userId: currentUser.user.id,
              provider: "gemini",
            },
          },
        })
      : Promise.resolve(null),
    userChannel
      ? prisma.channel.findUnique({
          where: { id: userChannel.id },
          include: { brandKit: true },
        })
      : null,
    prisma.appSetting.findFirst(),
  ]);

  const state: OnboardingState = {
    hasGeminiKey: Boolean(geminiCred && geminiCred.status === "connected"),
    hasNiche: Boolean(channel?.niche),
    nicheName: channel?.niche ?? null,
    hasBrand: Boolean(channel?.brandKitId),
    brandName: channel?.brandKit?.chosenName ?? channel?.name ?? null,
    isOnboarded: Boolean(settings?.onboardedAt || geminiCred?.status === "connected"),
  };

  return <OnboardingWizard initial={state} />;
}
