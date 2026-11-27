// GitHub Actions render worker'ining to'liq oqimi — TZ 5.1 & TZ 7.
// Oqim: jobs jadvalidan navbatdagi produce job'ni oladi ->
// nisha/g'oya -> ssenariy (Gemini + skill) -> Gemini TTS -> FFmpeg render -> QA ->
// tayyor videoni Blob/R2'ga yuklaydi -> video status = "ready" -> job status = "done".

import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@autochannel/db";
import { decrypt } from "@autochannel/crypto";
import { createProvider, type AiProvider } from "@autochannel/ai";
import { generateReelsScript } from "./script-engine";
import { validateScriptQa } from "./qa-rules";
import { renderReelsVideo } from "./renderer";
import { uploadVideoAndCover } from "./storage";

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 16) {
    throw new Error("ENCRYPTION_KEY muhit o'zgaruvchisi topilmadi yoki 16 belgidan kam.");
  }
  return key;
}

async function getDecryptedGeminiProvider(userId?: string | null): Promise<AiProvider> {
  const encKey = getEncryptionKey();
  const cred = userId
    ? await prisma.apiCredential.findUnique({
        where: { userId_provider: { userId, provider: "gemini" } },
      })
    : null;

  if (!cred) {
    // Agar foydalanuvchi kaliti topilmasa, tizim cron muhit o'zgaruvchisidan tekshiramiz
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey) return createProvider("gemini", envKey);
    throw new Error("Gemini API kaliti topilmadi (foydalanuvchi kaliti yoki GEMINI_API_KEY).");
  }

  const rawKey = decrypt(cred.encryptedKey, encKey);
  return createProvider("gemini", rawKey);
}

async function main() {
  const inputJobId = process.env.JOB_ID;
  console.log(`[worker] Boshlandi (jobId=${inputJobId ?? "navbatdagi"})`);

  // 1. Tizim pauza holatini tekshirish
  const settings = await prisma.appSetting.findFirst();
  if (settings?.paused) {
    console.log(`[worker] Tizim to'xtatilgan (pauza): ${settings.pauseReason ?? "Admin tomonidan"}`);
    return;
  }

  // 2. Ishga tushiriladigan Job'ni topish
  let job;
  if (inputJobId) {
    job = await prisma.job.findUnique({ where: { id: inputJobId } });
  } else {
    job = await prisma.job.findFirst({
      where: {
        type: { in: ["produce_daily", "produce"] },
        status: { in: ["pending", "failed"] },
      },
      orderBy: { runAt: "asc" },
    });
  }

  if (!job) {
    console.log("[worker] Bajarilishi kerak bo'lgan vazifa (job) topilmadi.");
    return;
  }

  // Job'ni 'running' holatiga o'tkazish
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "running",
      startedAt: new Date(),
      attempts: { increment: 1 },
      error: null,
    },
  });

  const outputDir = join(process.cwd(), "tmp", "render", job.id);

  try {
    // 3. Ishlanadigan Video'ni aniqlash
    let video;
    if (job.videoId) {
      video = await prisma.video.findUnique({
        where: { id: job.videoId },
        include: { channel: { include: { brandKit: true } }, idea: true, scripts: { where: { isActive: true }, take: 1 } },
      });
    }

    if (!video) {
      video = await prisma.video.findFirst({
        where: { status: { in: ["idea", "script", "voice"] } },
        include: { channel: { include: { brandKit: true } }, idea: true, scripts: { where: { isActive: true }, take: 1 } },
        orderBy: { scheduledFor: "asc" },
      });
    }

    if (!video) {
      throw new Error("Ishlab chiqarish uchun rejalashtirilgan video topilmadi.");
    }

    const aiProvider = await getDecryptedGeminiProvider(video.channel.userId);

    console.log(`[worker] Video aniqlandi: "${video.idea?.topic ?? video.id}" (status: ${video.status})`);

    const channel = video.channel;
    const niche = channel.niche || "Foydali Ma'lumotlar";
    const brandKit = channel.brandKit;
    const channelName = brandKit?.chosenName || channel.name || "AutoChannel";

    // 4. Bosqich 1: Ssenariy tayyorlash (agar mavjud bo'lmasa)
    let activeScript = video.scripts[0];
    let shotList = Array.isArray(activeScript?.shotList) ? (activeScript.shotList as any) : null;
    let voiceText = activeScript?.text;

    if (!activeScript || !shotList || !voiceText) {
      console.log("[worker] [Bosqich 1] Ssenariy generatsiya qilinmoqda...");
      const skill = await prisma.skill.findFirst({ where: { isActive: true } });
      const topic = video.idea?.topic || `${niche} bo'yicha kundalik tavsiya`;

      const generatedScript = await generateReelsScript(aiProvider, {
        topic,
        niche,
        skillText: skill?.text,
      });

      // QA tekshiruvi
      const qa = validateScriptQa(generatedScript);

      const createdScript = await prisma.script.create({
        data: {
          videoId: video.id,
          text: generatedScript.fullVoiceText,
          shotList: generatedScript.shotList as any,
          hookText: generatedScript.hook,
          ctaText: generatedScript.cta,
          isActive: true,
        },
      });

      await prisma.video.update({
        where: { id: video.id },
        data: {
          status: "script",
          caption: generatedScript.captions.engaging,
          hashtags: generatedScript.hashtags,
          durationSec: generatedScript.estimatedDurationSec,
          qaReport: qa as any,
        },
      });

      activeScript = createdScript;
      shotList = generatedScript.shotList;
      voiceText = generatedScript.fullVoiceText;
    }

    // 5. Bosqich 2: Gemini TTS bilan ovoz generatsiyasi
    console.log("[worker] [Bosqich 2] Gemini TTS ovoz generatsiyasi...");
    const voiceId = brandKit?.voiceId || "Puck"; // Spike testida tasdiqlangan ovoz
    const speech = await aiProvider.generateSpeech(voiceText, { voice: voiceId });

    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(outputDir, { recursive: true });
    const audioPath = join(outputDir, "voice.wav");
    await writeFile(audioPath, speech.wav);

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "voice" },
    });

    // 6. Bosqich 3: FFmpeg orqali 1080x1920 video render qilish
    console.log("[worker] [Bosqich 3] FFmpeg montaj va render (1080x1920)...");

    let backgroundMedia: { type: "video" | "image"; path: string } | undefined;

    try {
      const pexelsCred = channel.userId
        ? await prisma.apiCredential.findUnique({
            where: { userId_provider: { userId: channel.userId, provider: "pexels" } },
          })
        : null;
      const pexelsKey = pexelsCred
        ? decrypt(pexelsCred.encryptedKey, getEncryptionKey())
        : process.env.PEXELS_API_KEY;

      if (pexelsKey) {
        const { PexelsProvider } = await import("@autochannel/integrations");
        const pexels = new PexelsProvider(pexelsKey);
        const searchQuery = video.idea?.topic?.slice(0, 30) || niche;
        const videos = await pexels.searchVerticalVideos(searchQuery, 1);

        if (videos.length > 0 && videos[0].videoFiles.length > 0) {
          const file =
            videos[0].videoFiles.find((f) => f.height >= 1080) ||
            videos[0].videoFiles[0];

          if (file?.link) {
            console.log(`[worker] Pexels stock video topildi: ${file.link.slice(0, 50)}...`);
            const bgResponse = await fetch(file.link, {
              signal: AbortSignal.timeout(30_000),
            });
            if (bgResponse.ok) {
              const bgBuffer = Buffer.from(await bgResponse.arrayBuffer());
              const bgPath = join(outputDir, "stock_bg.mp4");
              await writeFile(bgPath, bgBuffer);
              backgroundMedia = { type: "video", path: bgPath };
            }
          }
        }
      }
    } catch (pexelsErr) {
      console.warn(
        "[worker] Pexels stock video yuklashda ogohlantirish (standart fon ishlatiladi):",
        pexelsErr,
      );
    }

    const renderResult = await renderReelsVideo({
      audioPath,
      shotList,
      channelName,
      outputDir,
      durationSec: speech.durationSec,
      backgroundMedia,
    });

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "render" },
    });

    // 7. Bosqich 4: Video QA tekshiruvi
    console.log("[worker] [Bosqich 4] Video QA tekshiruvi...");
    const videoData = await readFile(renderResult.videoPath);
    const coverData = await readFile(renderResult.coverPath);

    if (videoData.length < 1024) {
      throw new Error("Render qilingan video hajmi juda kichik (xatolik yuz bergan).");
    }

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "qa" },
    });

    // 8. Bosqich 5: Vercel Blob / Storage yuklash
    console.log("[worker] [Bosqich 5] Storage'ga yuklash...");
    const uploadResult = await uploadVideoAndCover(videoData, coverData, video.id);

    // Videoni "ready" (joylashga tayyor) holatiga o'tkazish
    await prisma.video.update({
      where: { id: video.id },
      data: {
        status: "ready",
        fileUrl: uploadResult.videoUrl,
        coverUrl: uploadResult.coverUrl,
        durationSec: renderResult.durationSec,
      },
    });

    // 9. Job'ni 'done' holatiga o'tkazish
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "done",
        finishedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actor: "worker",
        action: "render.success",
        target: `videos/${video.id}`,
        details: {
          jobId: job.id,
          videoUrl: uploadResult.videoUrl,
          durationSec: renderResult.durationSec,
        },
      },
    });

    console.log(`[worker] Muvaffaqiyatli tugadi! Video tayyor: ${uploadResult.videoUrl}`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[worker] Xatolik yuz berdi:", errorMsg);

    // Xatolikni job'ga yozish
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        error: errorMsg,
        finishedAt: new Date(),
      },
    });

    throw err;
  } finally {
    // Vaqtinchalik fayllarni tozalash
    await rm(outputDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

main().catch((err) => {
  console.error("[worker] Kritik xato:", err);
  process.exit(1);
});
