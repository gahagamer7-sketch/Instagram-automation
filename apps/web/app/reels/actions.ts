"use server";

import { prisma, IdeaStatus } from "@autochannel/db";
import { getCurrentUser } from "@/lib/session";
import { getAiProvider, getGeminiTtsProvider, getUserProviderKey } from "@/lib/credentials";
import { getActiveSkill, getSkillText } from "@/lib/skills";
import { createVideoFromIdea } from "@autochannel/core";
import { revalidatePath } from "next/cache";

export interface CreateVideoInput {
  topic: string;
  aiProvider?: "groq" | "gemini";
  voiceId?: string;
  customSkillText?: string;
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
 * Foydalanuvchi kiritgan g'oya va skill asosida to'liq avtomatlashgan video yaratadi.
 * Eslatma: Ssenariy uchun Groq yoki Gemini, ovoz uchun har doim tabiiy Gemini TTS ishlatiladi.
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

    // 3. Skill matnini aniqlash
    let skillText = input.customSkillText?.trim();
    if (!skillText) {
      const activeSkill = await getActiveSkill();
      if (activeSkill) {
        skillText = (await getSkillText(activeSkill.id)) ?? undefined;
      }
    }

    // 4. Foydalanuvchining shaxsiy Pexels API kaliti (agar kiritilgan bo'lsa)
    const pexelsApiKey = (await getUserProviderKey(currentUser.user.id, "pexels")) ?? undefined;

    // 5. Foydalanuvchi kanali
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

    // 6. Videoni generatsiya qilish (Ssenariy -> Ovoz -> Subtitr -> Render -> Storage)
    const result = await createVideoFromIdea({
      topic,
      niche: channel.niche || "Foydali Ma'lumotlar",
      skillText: skillText || undefined,
      channelName: channel.name,
      voiceId: input.voiceId || "Puck",
      textAiProvider: textLookup.provider,
      ttsAiProvider: ttsLookup.provider,
      pexelsApiKey,
    });

    // 7. Bazaga saqlash
    const idea = await prisma.contentIdea.create({
      data: {
        channelId: channel.id,
        topic: result.title,
        source: "studio",
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
 * Bir zumda trenddagi 3-5 ta g'oyani taklif qilish.
 */
export async function suggestIdeasAction(
  niche: string = "Foydali Ma'lumotlar",
  aiProvider: "groq" | "gemini" = "groq",
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

    const prompt = `Sen professional qisqa videolar (Reels, TikTok, Shorts) uchun trenddagi g'oyalar mutaxassisisan.
Nisha: "${niche}".
Iltimos, o'zbek tilida tomoshabin diqqatini birinchi 2 soniyada ushlab qoladigan 4 ta qiziqarli video g'oyasi/mavzusini taklif qil.
Har bir g'oya bitta qisqa, aniq va jalb qiluvchi jumla bo'lsin.
Faqat JSON massiv shaklida javob ber: ["G'oya 1", "G'oya 2", "G'oya 3", "G'oya 4"].`;

    const res = await aiLookup.provider.generateText(prompt, { jsonMode: true, maxOutputTokens: 300 });
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
        "Vaqtni to'g'ri boshqarishning 3 ta oltin qoidasi",
        "Har kuni ertalab qilinishi kerak bo'lgan 2 ta muhim odat",
        "Miyani chalg'ituvchi 3 ta xato va ularning yechimi",
        "Har oy daromadning 10 foizini jamg'arish siri",
      ],
      error: err instanceof Error ? err.message : "G'oya olishda xatolik",
    };
  }
}

