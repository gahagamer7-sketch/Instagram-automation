import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import { ReelsGrid, type ReelCardItem } from "@/components/reels/reels-grid";

export const metadata = {
  title: "Reels kutubxonasi — AutoChannel",
};

export default function ReelsPage() {
  return (
    <>
      <PageHeader
        title="Reels kutubxonasi"
        description="Barcha tayyorlangan Reels videolari: 9:16 maket, caption, ssenariylar va QA tahlili (TZ 4.12)."
      />

      <Suspense fallback={<CardSkeleton lines={6} />}>
        <ReelsContent />
      </Suspense>
    </>
  );
}

async function ReelsContent() {
  const videos = await prisma.video.findMany({
    include: {
      idea: true,
      scripts: {
        where: { isActive: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const reelItems: ReelCardItem[] = videos.map((v) => {
    const activeScript = v.scripts[0];
    const qaReport = (v.qaReport as any) || null;

    return {
      id: v.id,
      topic: v.idea?.topic || "Reels videosi",
      status: v.status,
      scheduledFor: v.scheduledFor?.toISOString() ?? null,
      publishedAt: v.publishedAt?.toISOString() ?? null,
      durationSec: v.durationSec ? Math.round(v.durationSec) : null,
      caption: v.caption,
      hashtags: v.hashtags,
      qaPassed: Boolean(qaReport?.passed),
      qaScore: typeof qaReport?.score === "number" ? qaReport.score : undefined,
      fileUrl: v.fileUrl,
      coverUrl: v.coverUrl,
      scriptText: activeScript?.text ?? null,
    };
  });

  return <ReelsGrid items={reelItems} />;
}
