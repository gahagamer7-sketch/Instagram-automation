import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@autochannel/db";

export interface DashboardData {
  pendingVideos: number;
  readyVideos: number;
  publishedVideos: number;
  failedVideos: number;
  todayCostUsd: number;
  nextScheduledAt: string | null;
  plays7d: number;
  followers: number;
}

export type DashboardResult =
  | { ok: true; data: DashboardData }
  | { ok: false; error: string };

/** Toshkent vaqti (UTC+5) bo'yicha bugungi kunning boshlanishi. */
function startOfTodayTashkent(now: Date): Date {
  const offsetMs = 5 * 60 * 60 * 1000;
  const local = new Date(now.getTime() + offsetMs);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - offsetMs);
}

async function loadDashboardData(): Promise<DashboardResult> {
  // `new Date()` va baza o'qishi faqat so'rov vaqtida bo'lishi kerak.
  await connection();
  const now = new Date();

  try {
    const since = startOfTodayTashkent(now);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      pendingVideos,
      readyVideos,
      publishedVideos,
      failedVideos,
      costSum,
      nextVideo,
      playsSum,
      followersSum,
    ] = await Promise.all([
      prisma.video.count({
        where: { status: { in: ["idea", "script", "voice", "render", "qa"] } },
      }),
      prisma.video.count({ where: { status: { in: ["ready", "publishing"] } } }),
      prisma.video.count({ where: { status: "published" } }),
      prisma.video.count({ where: { status: "failed" } }),
      prisma.costLog.aggregate({
        _sum: { costUsd: true },
        where: { createdAt: { gte: since } },
      }),
      prisma.video.findFirst({
        where: { scheduledFor: { gte: now } },
        orderBy: { scheduledFor: "asc" },
        select: { scheduledFor: true },
      }),
      prisma.analyticsSnapshot.aggregate({
        _sum: { plays: true },
        where: { date: { gte: weekAgo } },
      }),
      prisma.analyticsSnapshot.aggregate({ _sum: { followersGained: true } }),
    ]);

    return {
      ok: true,
      data: {
        pendingVideos,
        readyVideos,
        publishedVideos,
        failedVideos,
        todayCostUsd: Number(costSum._sum.costUsd ?? 0),
        nextScheduledAt: nextVideo?.scheduledFor?.toISOString() ?? null,
        plays7d: Number(playsSum._sum.plays ?? 0),
        followers: Number(followersSum._sum.followersGained ?? 0),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: message.split("\n")[0]?.slice(0, 160) ?? "Baza xatosi",
    };
  }
}

/** Bir so'rov ichida takroriy chaqiruvlarni birlashtiradi. */
export const getDashboardData = cache(loadDashboardData);
