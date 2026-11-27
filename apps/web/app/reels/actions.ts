"use server";

import { prisma, IdeaStatus } from "@autochannel/db";
import { getCurrentUser } from "@/lib/session";
import { getAiProvider, getGeminiTtsProvider, getUserProviderKey } from "@/lib/credentials";
import {
  createVideoFromIdea,
  getAnimationStyle,
  type AnimationStyleId,
} from "@autochannel/core";
import { revalidatePath } from "next/cache";

export interface CreateVideoInput {
  topic: string;
  styleId?: AnimationStyleId;
  aiProvider?: "groq" | "gemini";
  voiceId?: string;
  hookStyle?: string;
}

export interface CreateVideoResponse {
  ok: boolean;
  message?: string;
  videoId?: string;
  videoUrl?: string;
  coverUrl?: string;
  title?: string;
  caption?: string;
  hashtags?: string[];
  durationSec?: number;
}

/**
 * Foydalanuvchi kiritgan g'oya va tanlangan animatsiya uslubi asosida 1080x1920 video yaratadi.
 */
export async function createVideoAction(
  input: CreateVideoInput,
): Promise<CreateVideoResponse> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { ok: false, message: "Avtorizatsiyadan o'tilmagan. Iltimos tizimga kiring." };
    }

    const topic = input.topic?.trim();
    if (!topic || topic.length < 3) {
      return { ok: false, message: "Iltimos, video mavzusi yoki g'oyasini kiriting (kamida 3 belgi)." };
    }

    const aiChoice = input.aiProvider ?? "groq";
    const styleProfile = getAnimationStyle(input.styleId);

    // 1. Ssenariy yozuvchi AI provayderi (Groq yoki Gemini)
    const textLookup = await getAiProvider(aiChoice, currentUser.user.id);
    if (!textLookup.ok) {
      return { ok: false, message: textLookup.message };
    }

    // 2. Ovoz (TTS) sintezi uchun har doim foydalanuvchining shaxsiy Gemini provayderi
    const ttsLookup = await getGeminiTtsProvider(currentUser.user.id);
    if (!ttsLookup.ok) {
      return { ok: false, message: ttsLookup.message };
    }

    // 3. Foydalanuvchining shaxsiy Pexels API kaliti (agar kiritilgan bo'lsa)
    const pexelsApiKey = (await getUserProviderKey(currentUser.user.id, "pexels")) ?? undefined;

    // 4. Foydalanuvchi kanali
    let channel = currentUser.channel;
    if (!channel) {
      channel = await prisma.channel.create({
        data: {
          userId: currentUser.user.id,
          name: currentUser.user.name || "Mening Kanalim",
          platform: "instagram",
          status: "active",
          niche: "Foydali Ma'lumotlar",
        },
      });
    }

    const hookHint = input.hookStyle ? `Hook uslubi: ${input.hookStyle}` : undefined;

    // 5. Videoni generatsiya qilish (Uslubiy Ssenariy -> Ovoz -> Subtitr -> Render -> Storage)
    const result = await createVideoFromIdea({
      topic,
      niche: channel.niche || "Foydali Ma'lumotlar",
      styleId: styleProfile.id,
      skillText: hookHint,
      channelName: channel.name,
      voiceId: input.voiceId || styleProfile.defaultVoiceId,
      textAiProvider: textLookup.provider,
      ttsAiProvider: ttsLookup.provider,
      pexelsApiKey,
    });

    // 6. Bazaga saqlash
    const idea = await prisma.contentIdea.create({
      data: {
        channelId: channel.id,
        topic: result.title,
        source: styleProfile.id,
        status: IdeaStatus.used,
      },
    });

    const savedVideo = await prisma.video.create({
      data: {
        channelId: channel.id,
        ideaId: idea.id,
        status: "ready",
        caption: result.caption,
        hashtags: result.hashtags,
        durationSec: result.durationSec,
        fileUrl: result.videoUrl,
        coverUrl: result.coverUrl,
        qaReport: result.qaReport as any,
        scripts: {
          create: {
            text: result.script.fullVoiceText,
            shotList: result.script.shotList as any,
            hookText: result.script.hook,
            ctaText: result.script.cta,
            isActive: true,
          },
        },
      },
    });

    revalidatePath("/reels");
    revalidatePath("/dashboard");

    return {
      ok: true,
      videoId: savedVideo.id,
      videoUrl: result.videoUrl,
      coverUrl: result.coverUrl,
      title: result.title,
      caption: result.caption,
      hashtags: result.hashtags,
      durationSec: result.durationSec,
    };
  } catch (err) {
    console.error("createVideoAction xatosi:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Video yaratishda kutilmagan xatolik yuz berdi.",
    };
  }
}

/**
 * Tanlangan animatsiya uslubi va nisha asosida 4 ta trend g'oyani taklif qilish.
 */
export async function suggestIdeasAction(
  niche: string = "Foydali Ma'lumotlar",
  aiProvider: "groq" | "gemini" = "groq",
  styleId: AnimationStyleId = "deep-dive",
): Promise<{ ok: boolean; ideas: string[]; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { ok: false, ideas: [], error: "Avtorizatsiyadan o'tilmagan." };
    }
    const aiLookup = await getAiProvider(aiProvider, currentUser.user.id);
    if (!aiLookup.ok) {
      return { ok: false, ideas: [], error: aiLookup.message };
    }

    const styleProfile = getAnimationStyle(styleId);
    const prompt = `Sen professional qisqa videolar (Faceless Shorts, Reels, TikTok) uchun g'oyalar mutaxassisisan.
Tanlangan animatsiya uslubi: "${styleProfile.name}" — ${styleProfile.summary}
Uslubga eng mos mavzular: ${styleProfile.bestFor}
Qo'shimcha nisha yo'nalishi: "${niche}".
Iltimos, o'zbek tilida aynan "${styleProfile.name}" animatsiya uslubiga juda mos keladigan, birinchi 2 soniyada diqqatni ushlab qoladigan 4 ta qiziqarli video mavzusi taklif qil.
Har bir g'oya bitta qisqa, aniq va jalb qiluvchi jumla bo'lsin.
Faqat JSON massiv shaklida javob ber: ["G'oya 1", "G'oya 2", "G'oya 3", "G'oya 4"].`;

    const res = await aiLookup.provider.generateText(prompt, { jsonMode: true, maxOutputTokens: 350 });
    const parsed = JSON.parse(res.text);
    const ideas = Array.isArray(parsed) ? parsed : Object.values(parsed);

    return {
      ok: true,
      ideas: ideas.map((item: any) => String(item).trim()).filter(Boolean),
    };
  } catch (err) {
    return {
      ok: false,
      ideas: [
        "Agar 3 kun umuman uxlamasangiz miyangizda nima sodir bo'ladi?",
        "Nega insonlar qorong'uda g'alati tovushlarni eshitgandek bo'ladi?",
        "Lift uzilib ketsa omon qolish uchun nima qilish kerak?",
        "Birgina novvoyxona tufayli butun London qanday yonib ketgan?",
      ],
      error: err instanceof Error ? err.message : "G'oya olishda xatolik",
    };
  }
}
