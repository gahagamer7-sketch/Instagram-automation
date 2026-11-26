import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { DiscoverForm } from "@/components/niche/discover-form";
import { prisma } from "@autochannel/db";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Nisha tahlili — AutoChannel",
};

export default function NichePage() {
  return (
    <>
      <PageHeader
        title="Nisha tahlili"
        description="Signal manbalardan nomzodlarni yig'adi, 5-mezonli ballaydi va g'olibni tanlaydi (TZ 4.0)."
      />

      <Suspense fallback={<CardSkeleton lines={6} />}>
        <NicheContent />
      </Suspense>
    </>
  );
}

async function NicheContent() {
  const currentUser = await getCurrentUser();

  const [candidates, channel] = await Promise.all([
    prisma.nicheCandidate.findMany({
      orderBy: { scoreTotal: "desc" },
      take: 20,
    }),
    currentUser?.channel
      ? prisma.channel.findUnique({
          where: { id: currentUser.channel.id },
          select: { niche: true },
        })
      : prisma.channel.findFirst({ select: { niche: true } }),
  ]);

  const initialCandidates = candidates.map((c) => ({
    id: c.id,
    niche: c.niche,
    source: ((c.signals as Record<string, unknown>)?.source as string) || "llm",
    status: c.status,
    scores: {
      demand: c.scoreDemand,
      competition: c.scoreCompetition,
      automation: c.scoreAutomation,
      monetization: c.scoreMonetization,
      contentReserve: c.scoreContentReserve,
      total: c.scoreTotal,
    },
    signals: (c.signals as Record<string, unknown>) ?? {},
  }));

  return (
    <DiscoverForm
      initialCandidates={initialCandidates}
      currentNiche={channel?.niche ?? null}
    />
  );
}
