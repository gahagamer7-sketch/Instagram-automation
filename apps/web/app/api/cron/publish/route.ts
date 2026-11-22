import { NextResponse } from "next/server";
import { prisma } from "@autochannel/db";
import { decrypt } from "@autochannel/crypto";
import { InstagramGraphProvider } from "@autochannel/integrations";

function authorized(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return auth === `Bearer ${secret}`;
}

// Vercel Cron #2 (har soatda): joylash vaqti yetgan "ready" videoni topadi va
// Instagram Graph API orqali joylaydi. Idempotent va avto-pauza himoyasiga ega (TZ 4.6).
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // 1. Tizim holati tekshiruvi (TZ 4.5)
    const settings = await prisma.appSetting.findFirst();
    if (settings?.paused) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: `Tizim to'xtatilgan: ${settings.pauseReason ?? "Admin tomonidan"}`,
      });
    }

    const now = new Date();

    // 2. Joylash vaqti kelgan tayyor videolarni topish
    const dueVideos = await prisma.video.findMany({
      where: {
        status: "ready",
        scheduledFor: { lte: now },
        publishedAt: null,
      },
      include: { channel: { include: { oauthToken: true } } },
      take: 2, // Bir vaqtda ko'pi bilan 2 ta
    });

    if (dueVideos.length === 0) {
      return NextResponse.json({
        ok: true,
        published: [],
        message: "Hozirda joylanishi kerak bo'lgan video yo'q.",
      });
    }

    const publishedResults: Array<{ id: string; status: string; error?: string }> = [];
    let consecutiveErrors = 0;

    for (const video of dueVideos) {
      const channel = video.channel;
      const oauth = channel?.oauthToken;

      // Agar Meta OAuth tokeni hali ulanmagan bo'lsa
      if (!oauth?.accessToken || !channel?.igUserId) {
        await prisma.video.update({
          where: { id: video.id },
          data: {
            error: "Instagram OAuth tokeni yoki igUserId ulanmagan",
          },
        });
        publishedResults.push({
          id: video.id,
          status: "pending_auth",
          error: "Instagram akkaunti ulanmagan (Onboarding)",
        });
        continue;
      }

      // Instagram Graph API bilan joylash
      try {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: "publishing" },
        });

        if (!video.fileUrl) {
          throw new Error("Video fayl havolasi (fileUrl) mavjud emas.");
        }

        const encKey = process.env.ENCRYPTION_KEY;
        if (!encKey) {
          throw new Error("ENCRYPTION_KEY sozlanmagan.");
        }

        const decryptedToken = decrypt(oauth.accessToken, encKey);
        const igProvider = new InstagramGraphProvider(decryptedToken);

        // Caption va hashtaglar tayyorlash (TZ 4.6: AI belgisi bilan)
        const hashtagText = video.hashtags.length > 0 ? `\n\n${video.hashtags.join(" ")}` : "";
        const aiDisclosure = video.aiLabeled ? "\n\n🤖 Kontent sun'iy intellekt yordamida yaratilgan" : "";
        const fullCaption = `${video.caption ?? ""}${hashtagText}${aiDisclosure}`.trim();

        // 1. Container yaratish
        const containerId = await igProvider.createReelsContainer({
          igUserId: channel.igUserId,
          videoUrl: video.fileUrl,
          caption: fullCaption,
          coverUrl: video.coverUrl ?? undefined,
        });

        // 2. Status FINISHED bo'lguncha kutish
        await igProvider.waitForContainerReady(containerId, 180, 5000);

        // 3. E'lon qilish (media_publish)
        const mediaId = await igProvider.publishMedia(channel.igUserId, containerId);

        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: "published",
            publishedAt: new Date(),
            igContainerId: containerId,
            igMediaId: mediaId,
          },
        });

        await prisma.auditLog.create({
          data: {
            actor: "cron.publish",
            action: "reels.published",
            target: `videos/${video.id}`,
            details: { mediaId, igUserId: channel.igUserId },
          },
        });

        publishedResults.push({ id: video.id, status: "published" });
        consecutiveErrors = 0;
      } catch (publishErr) {
        consecutiveErrors++;
        const errMsg = publishErr instanceof Error ? publishErr.message : String(publishErr);

        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: "failed",
            error: errMsg,
            attempts: { increment: 1 },
          },
        });

        publishedResults.push({ id: video.id, status: "failed", error: errMsg });

        // Ketma-ket 2 ta xato bo'lsa -> AVTO-PAUZA (TZ 4.5)
        if (consecutiveErrors >= 2) {
          await prisma.appSetting.updateMany({
            data: {
              paused: true,
              pauseReason: "Ketma-ket 2 ta joylash xatosi yuz bergani uchun avto-pauza yoqildi.",
            },
          });
          break;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      published: publishedResults,
      autoPaused: consecutiveErrors >= 2,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
