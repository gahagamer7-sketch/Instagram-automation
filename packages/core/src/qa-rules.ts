// Sifat nazorati (QA & Safety) — TZ 4.5.
// Avto tekshiruvlar: ssenariy tuzilmasi, davomiylik, hook, CTA,
// kontent xavfsizligi (zo'ravonlik, nafrat, siyosat filtri).

import type { ReelsScript } from "./script-engine";

export interface QaCheckItem {
  id: string;
  name: string;
  passed: boolean;
  score: number; // 0..1
  message: string;
}

export interface QaResult {
  passed: boolean;
  score: number; // 0..1
  checks: QaCheckItem[];
  violations: string[];
}

// Taqiqlangan mavzu va so'zlar ro'yxati (Meta qoidalari va xavfsizlik filtri)
export const FORBIDDEN_WORDS = [
  "qimor",
  "kazino",
  "stavka",
  "1xbet",
  "porn",
  "terror",
  "qurol",
  "narkotik",
  "dori savdosi",
  "o'ldirish",
  "haqorat",
  "siyosiy to'ntarish",
  "fursatdan foydalanib aldash",
];

export function validateScriptQa(script: ReelsScript): QaResult {
  const checks: QaCheckItem[] = [];
  const violations: string[] = [];

  // 1. Hook tekshiruvi (0-3 soniyada kuchli kirish bormi?)
  const hasHook =
    Boolean(script.hook) &&
    script.hook.trim().length >= 10 &&
    script.shotList.some((s) => s.type === "hook");

  checks.push({
    id: "hook_presence",
    name: "0-3 soniya hook mavjudligi",
    passed: hasHook,
    score: hasHook ? 1 : 0,
    message: hasHook
      ? "Hook muvaffaqiyatli aniqlandi."
      : "Hook juda qisqa yoki shotList'da 'hook' turi mavjud emas.",
  });
  if (!hasHook) violations.push("Kuchli hook yetishmaydi");

  // 2. CTA tekshiruvi (Yakunda harakatga chaqiruv bormi?)
  const ctaWords = ["obuna", "saqla", "ulash", "izoh", "fikr", "yozing", "do'st", "bosing"];
  const hasCtaWord = ctaWords.some((w) => script.cta.toLowerCase().includes(w));
  const hasCtaCue = script.shotList.some((s) => s.type === "cta");
  const ctaPassed = hasCtaWord && hasCtaCue;

  checks.push({
    id: "cta_presence",
    name: "Harakatga chaqiruv (CTA)",
    passed: ctaPassed,
    score: ctaPassed ? 1 : hasCtaCue || hasCtaWord ? 0.5 : 0,
    message: ctaPassed
      ? "CTA to'liq qoidalarga mos."
      : "CTA'da obuna yoki izohga chaqiruvchi so'zlar yetarli emas.",
  });
  if (!ctaPassed) violations.push("Samarali CTA topilmadi");

  // 3. Davomiylik tekshiruvi (15 - 90 soniya oralig'i)
  const durationOk =
    script.estimatedDurationSec >= 15 && script.estimatedDurationSec <= 90;

  checks.push({
    id: "duration_bounds",
    name: "Reels davomiyligi (15-90s)",
    passed: durationOk,
    score: durationOk ? 1 : 0,
    message: durationOk
      ? `Taxminiy davomiylik: ${script.estimatedDurationSec}s (ideal).`
      : `Davomiylik noto'g'ri: ${script.estimatedDurationSec}s. 15-90s oralig'ida bo'lishi shart.`,
  });
  if (!durationOk) violations.push(`Davomiylik chegaradan tashqarida: ${script.estimatedDurationSec}s`);

  // 4. Sahnalar soni (kamida 3 ta sahna: hook, body, cta)
  const scenesCountOk = script.shotList.length >= 3;
  checks.push({
    id: "scene_structure",
    name: "Sahnalar strukturasi (>= 3 sahna)",
    passed: scenesCountOk,
    score: scenesCountOk ? 1 : 0.4,
    message: scenesCountOk
      ? `${script.shotList.length} ta sahna aniqlandi.`
      : "Sahnalar soni 3 tadan kam.",
  });
  if (!scenesCountOk) violations.push("Sahnalar soni yetarli emas");

  // 5. Xavfsizlik va taqiqlangan so'zlar filtri
  const fullText = `${script.title} ${script.fullVoiceText} ${script.hook} ${script.body} ${script.cta}`.toLowerCase();
  const matchedForbidden = FORBIDDEN_WORDS.filter((word) => fullText.includes(word));
  const safetyPassed = matchedForbidden.length === 0;

  checks.push({
    id: "content_safety",
    name: "Kontent xavfsizligi va taqiqlar",
    passed: safetyPassed,
    score: safetyPassed ? 1 : 0,
    message: safetyPassed
      ? "Taqiqlangan so'zlar yoki nojo'ya mavzular topilmadi."
      : `Xavfli so'zlar aniqlandi: ${matchedForbidden.join(", ")}`,
  });
  if (!safetyPassed) violations.push(`Taqiqlangan so'zlar: ${matchedForbidden.join(", ")}`);

  // 6. Matn tozaligi (chala qolib ketgan belgilar, placeholderlar)
  const placeholders = ["[insert", "todo", "lorem ipsum", "mavzu nomi", "qavs ichida"];
  const matchedPlaceholders = placeholders.filter((p) => fullText.includes(p));
  const cleanlinessPassed = matchedPlaceholders.length === 0;

  checks.push({
    id: "text_cleanliness",
    name: "Matn tozaligi va placeholderlar yo'qligi",
    passed: cleanlinessPassed,
    score: cleanlinessPassed ? 1 : 0.2,
    message: cleanlinessPassed
      ? "Matnda chala qolgan shablonlar yo'q."
      : `Shablon belgilari topildi: ${matchedPlaceholders.join(", ")}`,
  });
  if (!cleanlinessPassed) violations.push("Matnda to'ldirilmagan shablonlar mavjud");

  const totalScore =
    Math.round((checks.reduce((acc, c) => acc + c.score, 0) / checks.length) * 100) / 100;

  // QA o'tishi uchun: xavfsizlik 100% o'tishi shart va umumiy ball >= 0.70
  const passed = safetyPassed && totalScore >= 0.7;

  return {
    passed,
    score: totalScore,
    checks,
    violations,
  };
}
