import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import { getCurrentUser } from "@/lib/session";
import { CalendarView, type VideoCalendarItem } from "@/components/calendar/calendar-view";

export const metadata = {
  title: "Kontent kalendar — AutoChannel",
};

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Kontent kalendar"
        description="30 kunlik Reels rejasi, ssenariy generatori va jadval monitoringi (TZ 4.2, 4.3)."
      />

      <Suspense fallback={<CardSkeleton lines={6} />}>
        <CalendarContent />
      </Suspense>
    </>
  );
}

async function CalendarContent() {
  const currentUser = await getCurrentUser();
  const channelFilter = currentUser?.channel?.id ? { channelId: currentUser.channel.id } : {};

  const [channel, videos] = await Promise.all([
    currentUser?.channel
      ? prisma.channel.findUnique({
          where: { id: currentUser.channel.id },
          select: { niche: true },
        })
      : prisma.channel.findFirst({ select: { niche: true } }),
    prisma.video.findMany({
      where: channelFilter,
      include: {
        idea: true,
        scripts: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: { scheduledFor: "asc" },
      take: 50,
    }),
  ]);

  const activeNiche = channel?.niche || "Foydali Ma'lumotlar";

  const videoItems: VideoCalendarItem[] = videos.map((v) => {
    const activeScript = v.scripts[0];
    const qaReport = (v.qaReport as any) || null;

    return {
      id: v.id,
      status: v.status,
      topic: v.idea?.topic || "Reels mavzusi",
      scheduledFor: v.scheduledFor?.toISOString() ?? null,
      caption: v.caption,
      hashtags: v.hashtags,
      durationSec: v.durationSec ? Math.round(v.durationSec) : null,
      qaPassed: Boolean(qaReport?.passed),
      qaScore: typeof qaReport?.score === "number" ? qaReport.score : undefined,
      script: activeScript
        ? {
            id: activeScript.id,
            content: activeScript.text,
            shotList: Array.isArray(activeScript.shotList)
              ? (activeScript.shotList as any)
              : [],
          }
        : null,
    };
  });

  return <CalendarView videos={videoItems} activeNiche={activeNiche} />;
}
