import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import {
  PipelineView,
  type PipelineStageCount,
  type PipelineJobItem,
  type PipelineVideoItem,
} from "@/components/pipeline/pipeline-view";

export const metadata = {
  title: "Jonli pipeline — AutoChannel",
};

export default function PipelinePage() {
  return (
    <>
      <PageHeader
        title="Jonli pipeline"
        description="Video yaratish bosqichlari, navbatdagi ishlar va xatoliklar nazorati."
      />

      <Suspense fallback={<CardSkeleton lines={6} />}>
        <PipelineContent />
      </Suspense>
    </>
  );
}

async function PipelineContent() {
  const [settings, videoCounts, jobs, recentVideos] = await Promise.all([
    prisma.appSetting.findFirst({ select: { paused: true } }),
    prisma.video.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.video.findMany({
      include: { idea: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const countsMap = new Map<string, number>();
  for (const c of videoCounts) {
    countsMap.set(c.status, c._count._all);
  }

  const stageCounts: PipelineStageCount = {
    idea: countsMap.get("idea") ?? 0,
    script: countsMap.get("script") ?? 0,
    voice: countsMap.get("voice") ?? 0,
    render: countsMap.get("render") ?? 0,
    qa: countsMap.get("qa") ?? 0,
    ready: countsMap.get("ready") ?? 0,
    published: countsMap.get("published") ?? 0,
    failed: countsMap.get("failed") ?? 0,
  };

  const jobItems: PipelineJobItem[] = jobs.map((j) => ({
    id: j.id,
    type: j.type,
    status: j.status,
    attempts: j.attempts,
    maxAttempts: j.maxAttempts,
    error: j.error,
    runAt: j.runAt.toISOString(),
    startedAt: j.startedAt?.toISOString() ?? null,
    finishedAt: j.finishedAt?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
  }));

  const videoItems: PipelineVideoItem[] = recentVideos.map((v) => ({
    id: v.id,
    topic: v.idea?.topic || "Reels videosi",
    status: v.status,
    durationSec: v.durationSec ? Math.round(v.durationSec) : null,
    scheduledFor: v.scheduledFor?.toISOString() ?? null,
    updatedAt: v.updatedAt.toISOString(),
  }));

  return (
    <PipelineView
      stageCounts={stageCounts}
      jobs={jobItems}
      recentVideos={videoItems}
      isPaused={Boolean(settings?.paused)}
    />
  );
}
