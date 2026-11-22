import { NextResponse } from "next/server";
import { prisma } from "@autochannel/db";

function authorized(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  // Agar CRON_SECRET o'rnatilmagan bo'lsa (lokal dev), ruxsat beriladi
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

// Vercel Cron #1 (kuniga 1 marta): bugungi ishlab chiqarish job'ini yaratadi
// va GitHub Actions render worker'ini workflow_dispatch orqali ishga tushiradi.
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // 1. Tizim to'xtatilmaganligini tekshirish (TZ 4.5)
    const settings = await prisma.appSetting.findFirst();
    if (settings?.paused) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: `Tizim to'xtatilgan: ${settings.pauseReason ?? "Admin tomonidan"}`,
      });
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // 2. Idempotentlik tekshiruvi: bugun ishlab chiqarish job'i yaratilganmi?
    const existingJob = await prisma.job.findFirst({
      where: {
        type: "produce_daily",
        createdAt: { gte: todayStart },
      },
    });

    if (existingJob) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Bugungi produce_daily job allaqachon yaratilgan.",
        jobId: existingJob.id,
      });
    }

    // 3. Keyingi ishlab chiqarilishi kerak bo'lgan videoni aniqlash
    const nextVideo = await prisma.video.findFirst({
      where: {
        status: { in: ["idea", "script"] },
      },
      orderBy: { scheduledFor: "asc" },
    });

    // 4. Jobs jadvaliga yozuv qo'shish
    const job = await prisma.job.create({
      data: {
        type: "produce_daily",
        videoId: nextVideo?.id ?? null,
        status: "pending",
        payload: {
          videoId: nextVideo?.id ?? null,
          targetDate: now.toISOString(),
        },
      },
    });

    // 5. Agar GitHub Actions sozlamalari mavjud bo'lsa — workflow_dispatch chaqirish
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // format: "owner/repo"

    let dispatched = false;
    if (githubToken && githubRepo) {
      try {
        const ghRes = await fetch(
          `https://api.github.com/repos/${githubRepo}/actions/workflows/worker.yml/dispatches`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "autochannel-cron",
            },
            body: JSON.stringify({
              ref: "main",
              inputs: { jobId: job.id },
            }),
          },
        );
        dispatched = ghRes.ok;
      } catch (err) {
        console.warn("GitHub Actions dispatch chaqiruvida xatolik:", err);
      }
    }

    await prisma.auditLog.create({
      data: {
        actor: "cron.produce",
        action: "job.create",
        target: `jobs/${job.id}`,
        details: { videoId: nextVideo?.id, dispatched },
      },
    });

    return NextResponse.json({
      ok: true,
      job: { id: job.id, status: job.status, videoId: nextVideo?.id, dispatched },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
