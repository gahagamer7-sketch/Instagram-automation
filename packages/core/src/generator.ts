import { readFile, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AiProvider } from "@autochannel/ai";
import type { AnimationStyleId } from "./animation-styles";
import { generateReelsScript, ReelsScript } from "./script-engine";
import { validateScriptQa, QaResult } from "./qa-rules";
import { renderReelsVideo, RenderResult } from "./renderer";
import { uploadVideoAndCover, StorageUploadResult } from "./storage";
import { getRenderDir } from "./tmp-paths";

export interface CreateVideoOptions {
  topic: string;
  niche?: string;
  styleId?: AnimationStyleId;
  skillText?: string;
  channelName?: string;
  voiceId?: string; // Gemini TTS ovozi: Puck, Kore, Fenrir, Aoede
  textAiProvider: AiProvider; // Groq yoki Gemini
  ttsAiProvider: AiProvider; // Har doim Gemini TTS
  pexelsApiKey?: string;
  outputDir?: string;
}

export interface GeneratedVideoOutput {
  title: string;
  caption: string;
  hashtags: string[];
  durationSec: number;
  videoUrl: string;
  coverUrl: string;
  script: ReelsScript;
  qaReport: QaResult;
}

/**
 * G'oya va Skill asosida to'liq avtomatlashgan 1080x1920 video yaratish zanjiri:
 * 1. Ssenariy yozish (Groq Llama 3.3 yoki Gemini)
 * 2. Ovoz yozish (Har doim Gemini TTS)
 * 3. Fon media (Pexels yoki rangli gradient fon)
 * 4. Subtitrlar (.ass karaoke) va FFmpeg montaj
 * 5. Video va muqovani saqlash (Storage)
 */
export async function createVideoFromIdea(
  options: CreateVideoOptions,
): Promise<GeneratedVideoOutput> {
  const {
    topic,
    niche = "Foydali Ma'lumotlar",
    styleId = "deep-dive",
    skillText,
    channelName = "AutoChannel",
    voiceId = "Puck",
    textAiProvider,
    ttsAiProvider,
    pexelsApiKey,
  } = options;

  const runId = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const ownsOutputDir = !options.outputDir;
  const outputDir = options.outputDir ?? getRenderDir(runId);
  await mkdir(outputDir, { recursive: true });

  try {
    // 1. Ssenariy generatsiyasi (Groq yoki Gemini + tanlangan animatsiya uslubi)
    console.log(`[generator] 1. Ssenariy generatsiya qilinmoqda (${textAiProvider.name}, uslub: ${styleId})...`);
    const script = await generateReelsScript(textAiProvider, {
      topic,
      niche,
      styleId,
      skillText,
    });

    const qaReport = validateScriptQa(script);

    // 2. Ovoz (TTS) sintezi (Har doim Gemini TTS)
    console.log(`[generator] 2. Ovoz (TTS) sintezi (${ttsAiProvider.name}, ovoz: ${voiceId})...`);
    const speech = await ttsAiProvider.generateSpeech(script.fullVoiceText, {
      voice: voiceId,
    });

    const audioPath = join(outputDir, "voice.wav");
    await writeFile(audioPath, speech.wav);

    // 3. Fon media (Pexels yoki fallback)
    let backgroundMedia: { type: "video" | "image"; path: string } | undefined;

    if (pexelsApiKey) {
      try {
        const { PexelsProvider } = await import("@autochannel/integrations");
        const pexels = new PexelsProvider(pexelsApiKey);
        const searchQuery = topic.slice(0, 30);
        const searchRes = await pexels.searchVerticalVideos(searchQuery, 1);

        if (searchRes.length > 0 && searchRes[0].videoFiles.length > 0) {
          const file =
            searchRes[0].videoFiles.find((f) => f.height >= 1080) ||
            searchRes[0].videoFiles[0];

          if (file?.link) {
            const bgResponse = await fetch(file.link, {
              signal: AbortSignal.timeout(
                process.env.VERCEL ? 8_000 : 30_000,
              ),
            });
            if (bgResponse.ok) {
              const bgBuffer = Buffer.from(await bgResponse.arrayBuffer());
              const bgPath = join(outputDir, "stock_bg.mp4");
              await writeFile(bgPath, bgBuffer);
              backgroundMedia = { type: "video", path: bgPath };
            }
          }
        }
      } catch (pexelsErr) {
        console.warn("[generator] Pexels yuklashda ogohlantirish (standart fon ishlatiladi):", pexelsErr);
      }
    }

    // 4. FFmpeg montaj va render (1080x1920)
    console.log("[generator] 4. FFmpeg montaj va render (1080x1920)...");
    const renderResult: RenderResult = await renderReelsVideo({
      audioPath,
      shotList: script.shotList,
      channelName,
      styleId,
      outputDir,
      durationSec: speech.durationSec,
      backgroundMedia,
    });

    // 5. Video va muqovani saqlash
    console.log("[generator] 5. Storage yuklash...");
    const videoBuffer = await readFile(renderResult.videoPath);
    const coverBuffer = await readFile(renderResult.coverPath);

    const storageResult: StorageUploadResult = await uploadVideoAndCover(
      videoBuffer,
      coverBuffer,
      runId,
    );

    return {
      title: script.title,
      caption: script.captions.engaging,
      hashtags: script.hashtags,
      durationSec: Math.round(renderResult.durationSec),
      videoUrl: storageResult.videoUrl,
      coverUrl: storageResult.coverUrl,
      script,
      qaReport,
    };
  } finally {
    if (ownsOutputDir) {
      await rm(outputDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

