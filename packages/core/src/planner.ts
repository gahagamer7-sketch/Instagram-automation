import type { AiProvider } from "@autochannel/ai";

export interface PlannedIdea {
  topic: string;
  hookPremise: string;
  category: string;
  dayOffset: number; // 1..30 kun
}

export function buildPlannerPrompt(
  niche: string,
  skillText?: string,
  count: number = 15,
): string {
  const skillPart = skillText
    ? `\nKanal formati va yo'riqnomasi (Skill):\n${skillText.slice(0, 1500)}`
    : "";

  return [
    `Sen Instagram Reels uchun kontent-strategisan.`,
    `Nisha: "${niche}".`,
    `Auditoriya: O'zbekiston yoshlari (18-35 yosh), o'zbek tilida.`,
    skillPart,
    ``,
    `Ushbu nisha bo'yicha eng yuqori ehtimolli, tomoshabinni ushlab qoluvchi ${count} ta har xil Reels g'oyasini rejalashtir.`,
    `Har bir g'oya uchun:`,
    `- topic: aniq, jozibali mavzu sarlavhasi`,
    `- hookPremise: birinchi 3 soniyadagi e'tiborni tortuvchi syujet`,
    `- category: turkum (masalan: "Tavsiya", "Sir-asrorlar", "Xatolar", "Faktlar", "Motivatsiya")`,
    `- dayOffset: 1 dan ${count} gacha ketma-ketlik`,
    ``,
    `Faqat quyidagi JSON array formatida qaytar:`,
    `[`,
    `  {`,
    `    "topic": "...",`,
    `    "hookPremise": "...",`,
    `    "category": "...",`,
    `    "dayOffset": 1`,
    `  }`,
    `]`,
  ].join("\n");
}

export function parsePlannerResponse(
  rawText: string,
  niche: string,
  count: number = 15,
): PlannedIdea[] {
  try {
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
      rawText.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
    const items = JSON.parse(jsonStr);

    if (Array.isArray(items) && items.length > 0) {
      return items.slice(0, count).map((item: any, idx: number) => ({
        topic: String(item.topic || `${niche} bo'yicha #${idx + 1}-muhim qoida`).trim(),
        hookPremise: String(item.hookPremise || `Bu usulni bilmasangiz, ko'p vaqt yo'qotasiz!`).trim(),
        category: String(item.category || "Foydali tavsiya").trim(),
        dayOffset: Number(item.dayOffset ?? idx + 1),
      }));
    }
  } catch {
    // Agar parsing xato bo'lsa fallback g'oyalar to'plami
  }

  const defaultCategories = ["Sir-asrorlar", "Top xatolar", "Amaliy tavsiya", "Faktlar", "Qoidalar"];
  return Array.from({ length: count }).map((_, idx) => ({
    topic: `${niche} sohasida ko'pchilik qiladigan #${idx + 1}-xato`,
    hookPremise: `Buni bilmaslik sizga qimmatga tushishi mumkin!`,
    category: defaultCategories[idx % defaultCategories.length]!,
    dayOffset: idx + 1,
  }));
}

export async function generateContentCalendarIdeas(
  provider: AiProvider,
  niche: string,
  skillText?: string,
  count: number = 15,
): Promise<PlannedIdea[]> {
  const prompt = buildPlannerPrompt(niche, skillText, count);
  const result = await provider.generateText(prompt, {
    temperature: 0.75,
    maxOutputTokens: 2500,
  });

  return parsePlannerResponse(result.text, niche, count);
}

