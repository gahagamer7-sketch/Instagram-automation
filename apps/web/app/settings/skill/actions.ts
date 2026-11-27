"use server";

import { prisma } from "@autochannel/db";
import { refresh } from "next/cache";
import { getAiProvider } from "@/lib/credentials";
import { getCurrentUser } from "@/lib/session";
import { activateSkillVersion, createSkillVersion, SKILL_NAME } from "@/lib/skills";
import { validateSkillText } from "@/lib/skill-text";

export interface SkillActionResult {
  ok: boolean;
  message: string;
}

const MAX_PREVIEW = 8000;

function errorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return message.slice(0, 300);
}

/** Yangi skill versiyasini saqlash (ixtiyoriy: darhol faollashtirish). */
export async function saveSkillAction(
  _prev: SkillActionResult | null,
  formData: FormData,
): Promise<SkillActionResult> {
  const text = String(formData.get("text") ?? "");
  const activate = formData.get("activate") === "on";

  const result = await createSkillVersion({
    name: String(formData.get("name") ?? SKILL_NAME),
    text,
    activate,
  });

  if (result.ok) refresh();
  return { ok: result.ok, message: result.message };
}

/** Versiyalar tarixidan faol versiyani tanlash. */
export async function activateSkillAction(
  _prev: SkillActionResult | null,
  formData: FormData,
): Promise<SkillActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Versiya tanlanmagan." };

  try {
    const result = await activateSkillVersion(id);
    if (result.ok) refresh();
    return { ok: result.ok, message: result.message };
  } catch (err) {
    return { ok: false, message: errorMessage(err) };
  }
}

export interface SkillTestResult extends SkillActionResult {
  /** Ssenariy generatori qaytargan natija (JSON yoki xom matn). */
  output?: string;
  model?: string;
  tokens?: number;
  parsed?: boolean;
}

/**
 * "Sinab ko'rish" (TZ 4.13): joriy muharrir matnini skill sifatida berib,
 * haqiqiy Gemini chaqiruvi bilan namuna ssenariy yaratadi.
 */
export async function testSkillAction(
  _prev: SkillTestResult | null,
  formData: FormData,
): Promise<SkillTestResult> {
  const text = String(formData.get("text") ?? "");
  const topicRaw = String(formData.get("topic") ?? "").trim();
  const topic = topicRaw || "Telefon batareyasini kun bo'yi yetadigan qilish";

  const validation = validateSkillText(text);
  if (!validation.ok) return { ok: false, message: validation.message };

  const currentUser = await getCurrentUser();
  const lookup = await getAiProvider("gemini", currentUser?.user?.id);
  if (!lookup.ok) return { ok: false, message: lookup.message };

  const prompt = [
    `Mavzu: ${topic}`,
    "Nisha: umumiy o'zbek auditoriyasi (18–34 yosh)",
    "Davomiylik: 25–40 soniya",
    "",
    "Yuqoridagi skill qoidalariga to'liq amal qilib, bitta Reels ssenariysini",
    "faqat JSON ko'rinishida yoz. Hech qanday izoh yoki qo'shimcha matn qo'shma.",
  ].join("\n");

  try {
    const result = await lookup.provider.generateText(prompt, {
      skill: validation.text,
      jsonMode: true,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const tokens = result.usage?.totalTokens ?? 0;

    // Xarajat jurnali (TZ 4.10) — bepul tarifda costUsd = 0.
    await prisma.costLog
      .create({
        data: { provider: "gemini", kind: "text", amount: tokens, costUsd: 0 },
      })
      .catch(() => undefined);

    const raw = result.text.trim();
    let parsed = false;
    let output = raw;
    try {
      output = JSON.stringify(JSON.parse(raw), null, 2);
      parsed = true;
    } catch {
      // Model JSON qaytarmasa — xom matnni ko'rsatamiz.
    }

    return {
      ok: true,
      message: parsed
        ? `Ssenariy tayyor (${result.model}, ${tokens} token).`
        : `Model JSON qaytarmadi (${result.model}) — xom javob quyida.`,
      output: output.slice(0, MAX_PREVIEW),
      model: result.model,
      tokens,
      parsed,
    };
  } catch (err) {
    return { ok: false, message: `AI xatosi: ${errorMessage(err)}` };
  }
}
