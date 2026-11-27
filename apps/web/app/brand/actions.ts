"use server";

import { prisma } from "@autochannel/db";
import { refresh } from "next/cache";
import { getAiProvider } from "@/lib/credentials";
import { getCurrentUser } from "@/lib/session";
import { getActiveSkillText } from "@/lib/skills";
import {
  type BrandKitData,
  buildBrandPrompt,
  parseBrandKitResponse,
  DEFAULT_BRAND_COLORS,
} from "@/lib/brand";

export interface BrandActionResult {
  ok: boolean;
  message: string;
  data?: BrandKitData;
}

function errorMessage(err: unknown): string {
  return (err instanceof Error ? err.message : String(err)).slice(0, 300);
}

/**
 * Nisha va faol skill asosida yangi brend kitini generatsiya qiladi (TZ 4.1).
 */
export async function generateBrandAction(niche: string): Promise<BrandActionResult> {
  const targetNiche = niche?.trim() || "Foydali Ma'lumotlar";

  try {
    const currentUser = await getCurrentUser();
    const providerLookup = await getAiProvider("gemini", currentUser?.user?.id);
    if (providerLookup.ok) {
      const skillText = await getActiveSkillText();
      const prompt = buildBrandPrompt(targetNiche, skillText ?? undefined);

      const response = await providerLookup.provider.generateText(prompt, {
        temperature: 0.8,
        maxOutputTokens: 1500,
      });

      const brandData = parseBrandKitResponse(response.text, targetNiche);
      return {
        ok: true,
        message: "AI orqali yangi brend to'plami muvaffaqiyatli yaratildi.",
        data: brandData,
      };
    }
  } catch (err) {
    console.warn("AI brend generatsiyasida xato, standart shablonga o'tiladi:", err);
  }

  // Gemini kaliti bo'lmaganda yoki xatolikda barqaror generator ishlaydi
  const fallbackData = parseBrandKitResponse("", targetNiche);
  return {
    ok: true,
    message: "Standart brend to'plami generatsiya qilindi.",
    data: fallbackData,
  };
}

/**
 * Tanlangan brend kitini DB'da saqlaydi va kanalga biriktiradi (TZ 4.1).
 */
export async function saveBrandKitAction(
  data: BrandKitData,
  selectedAvatarSvg?: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    if (!data.chosenName) {
      return { ok: false, message: "Kanal nomi tanlanmagan." };
    }

    const currentUser = await getCurrentUser();
    const avatar = selectedAvatarSvg || data.avatars[0] || "";

    await prisma.$transaction(async (tx) => {
      // 1. Yangi BrandKit yaratamiz
      const brandKit = await tx.brandKit.create({
        data: {
          nameOptions: data.nameOptions,
          chosenName: data.chosenName,
          slogan: data.slogan,
          bio: data.bio.slice(0, 150),
          keywords: data.keywords,
          colors: data.colors as any,
          font: data.font || "Inter",
          voiceId: data.voiceId || "gemini-uz-natural-male",
          avatarUrl: avatar,
          coverTemplateUrl: data.coverTemplate,
          status: "applied",
        },
      });

      // 2. Foydalanuvchining kanalini topish yoki yaratish, brend kitini biriktirish
      const channel = currentUser?.user?.id
        ? await tx.channel.findFirst({ where: { userId: currentUser.user.id } })
        : await tx.channel.findFirst();
      if (!channel) {
        await tx.channel.create({
          data: {
            userId: currentUser?.user?.id,
            name: data.chosenName,
            brandKitId: brandKit.id,
            status: "setup",
          },
        });
      } else {
        await tx.channel.update({
          where: { id: channel.id },
          data: {
            name: data.chosenName,
            brandKitId: brandKit.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actor: "admin",
          action: "brand.applied",
          target: `brand_kit/${brandKit.id}`,
          details: { name: data.chosenName, slogan: data.slogan },
        },
      });
    });

    refresh();
    return {
      ok: true,
      message: `"${data.chosenName}" brendi muvaffaqiyatli saqlandi va kanalga biriktirildi!`,
    };
  } catch (err) {
    return { ok: false, message: `Saqlashda xato: ${errorMessage(err)}` };
  }
}

