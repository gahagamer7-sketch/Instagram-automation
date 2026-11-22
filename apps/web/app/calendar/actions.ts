"use server";

import { prisma } from "@autochannel/db";
import { refresh } from "next/cache";
import { getAiProvider } from "@/lib/credentials";
import { getActiveSkillText } from "@/lib/skills";
import {
  generateContentCalendarIdeas,
  generateReelsScript,
  validateScriptQa,
} from "@autochannel/core";

function errorMessage(err: unknown): string {
  return (err instanceof Error ? err.message : String(err)).slice(0, 300);
}

/**
 * 15-30 kunlik yangi Reels g'oyalarini kalendarga rejalashtiradi (TZ 4.2).
 */
export async function generateCalendarIdeasAction(
  count = 15,
): Promise<{ ok: boolean; message: string }> {
  try {
    const channel = await prisma.channel.findFirst();
    if (!channel) {
      return {
        ok: false,
        message: "Avval Nisha yoki Brend bo'limida kanalni sozlang.",
      };
    }

    const niche = channel.niche || "Foydali Ma'lumotlar";
    const skillText = await getActiveSkillText();
    const activeSkill = await prisma.skill.findFirst({ where: { isActive: true } });
    const settings = await prisma.appSetting.findFirst();
    const publishHour = settings?.publishHours?.[0] ?? 19; // 19:00 (UTC+5)

    const providerLookup = await getAiProvider();
    let ideas;
    if (providerLookup.ok) {
      ideas = await generateContentCalendarIdeas(
        providerLookup.provider,
        niche,
        skillText ?? undefined,
        count,
      );
    } else {
      const { parsePlannerResponse } = await import("@autochannel/core");
      ideas = parsePlannerResponse("", niche, count);
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      for (const idea of ideas) {
        const createdIdea = await tx.contentIdea.create({
          data: {
            channelId: channel.id,
            topic: idea.topic,
            source: "llm",
            status: "scheduled",
          },
        });

        const scheduledDate = new Date(now);
        scheduledDate.setDate(now.getDate() + idea.dayOffset);
        scheduledDate.setHours(publishHour, 0, 0, 0);

        await tx.video.create({
          data: {
            channelId: channel.id,
            ideaId: createdIdea.id,
            skillId: activeSkill?.id ?? null,
            status: "idea",
            scheduledFor: scheduledDate,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actor: "admin",
          action: "calendar.generate_ideas",
          target: `channels/${channel.id}`,
          details: { count: ideas.length, niche },
        },
      });
    });

    refresh();
    return {
      ok: true,
      message: `${ideas.length} ta yangi Reels g'oyasi kalendarga muvaffaqiyatli rejalashtirildi!`,
    };
  } catch (err) {
    return { ok: false, message: `Rejalashtirishda xato: ${errorMessage(err)}` };
  }
}

/**
 * Rejalashtirilgan video uchun to'liq ssenariy va shotList yaratadi (TZ 4.3).
 */
export async function generateScriptForVideoAction(
  videoId: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { idea: true, channel: true },
    });

    if (!video || !video.idea) {
      return { ok: false, message: "Video yoki mavzu topilmadi." };
    }

    const topic = video.idea.topic;
    const niche = video.channel.niche || "Foydali Ma'lumotlar";
    const skillText = await getActiveSkillText();

    const providerLookup = await getAiProvider();
    if (!providerLookup.ok) {
      return {
        ok: false,
        message: "Gemini API kaliti kiritilmagan. Sozlamalar bo'limida kalitni kiriting.",
      };
    }

    const script = await generateReelsScript(providerLookup.provider, {
      topic,
      niche,
      skillText: skillText ?? undefined,
    });

    const qa = validateScriptQa(script);

    await prisma.$transaction(async (tx) => {
      // Eski faol ssenariylarni nofaol qilamiz
      await tx.script.updateMany({
        where: { videoId: video.id, isActive: true },
        data: { isActive: false },
      });

      // Yangi ssenariy saqlash
      await tx.script.create({
        data: {
          videoId: video.id,
          text: script.fullVoiceText,
          shotList: script.shotList as any,
          hookText: script.hook,
          ctaText: script.cta,
          isActive: true,
        },
      });

      // Video holatini yangilash
      await tx.video.update({
        where: { id: video.id },
        data: {
          status: "script",
          caption: script.captions.engaging,
          hashtags: script.hashtags,
          durationSec: script.estimatedDurationSec,
          qaReport: qa as any,
        },
      });

      await tx.auditLog.create({
        data: {
          actor: "admin",
          action: "script.generate",
          target: `videos/${video.id}`,
          details: { topic, qaScore: qa.score, qaPassed: qa.passed },
        },
      });
    });

    refresh();
    return {
      ok: true,
      message: `"${topic}" uchun ssenariy muvaffaqiyatli tayyorlandi (QA balli: ${(qa.score * 100).toFixed(0)}%)!`,
    };
  } catch (err) {
    return { ok: false, message: `Ssenariy yaratishda xato: ${errorMessage(err)}` };
  }
}

/**
 * Videoni rejalashtirilgan vaqtini o'zgartirish.
 */
export async function updateScheduleDateAction(
  videoId: string,
  newDateIso: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const scheduledFor = new Date(newDateIso);
    await prisma.video.update({
      where: { id: videoId },
      data: { scheduledFor },
    });
    refresh();
    return { ok: true, message: "Rejalashtirilgan vaqt yangilandi." };
  } catch (err) {
    return { ok: false, message: `Vaqtni o'zgartirishda xato: ${errorMessage(err)}` };
  }
}

/**
 * Videoni kalendardan o'chirish.
 */
export async function deleteVideoAction(
  videoId: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    await prisma.video.delete({ where: { id: videoId } });
    refresh();
    return { ok: true, message: "Video kalendardan olib tashlandi." };
  } catch (err) {
    return { ok: false, message: `O'chirishda xato: ${errorMessage(err)}` };
  }
}
