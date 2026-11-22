/**
 * Skill matni qoidalari — sof funksiyalar (bazaga bog'liq emas, test qilinadi).
 * TZ 4.13: skill — video yaratish yo'riqnomasi; tizim qoidalari ustidan turadi.
 */

export const SKILL_MIN_CHARS = 200;
export const SKILL_MAX_CHARS = 20_000;

export type SkillValidation =
  | { ok: true; text: string }
  | { ok: false; message: string };

/** Matnni tozalaydi (orqa bo'shliqlar, CRLF) va hajmini tekshiradi. */
export function validateSkillText(raw: string): SkillValidation {
  const text = raw.replace(/\r\n/g, "\n").trim();

  if (text.length === 0) {
    return { ok: false, message: "Skill matni bo'sh. Yo'riqnoma yozing yoki .md fayl yuklang." };
  }

  if (text.length < SKILL_MIN_CHARS) {
    return {
      ok: false,
      message: `Skill juda qisqa (${text.length} belgi). Kamida ${SKILL_MIN_CHARS} belgi kerak — uslub, tuzilma va taqiqlar yozilishi shart.`,
    };
  }

  if (text.length > SKILL_MAX_CHARS) {
    return {
      ok: false,
      message: `Skill juda uzun (${text.length} belgi). Eng ko'pi ${SKILL_MAX_CHARS} belgi.`,
    };
  }

  return { ok: true, text };
}

/**
 * Skill tarkibida bo'lishi kutilgan bo'limlar (ogohlantirish uchun, majburiy emas).
 * TZ 4.13: uslub/ohang, tuzilma, vizual qoidalar, taqiqlar, namunalar.
 */
const EXPECTED_SECTIONS = [
  { key: "tuzilma", hrefs: ["tuzilma", "struktura", "hook"] },
  { key: "uslub", hrefs: ["uslub", "ohang", "ton"] },
  { key: "taqiq", hrefs: ["taqiq", "chegara", "prohibited"] },
];

export function missingSkillSections(text: string): string[] {
  const lower = text.toLowerCase();
  return EXPECTED_SECTIONS.filter(
    (section) => !section.hrefs.some((word) => lower.includes(word)),
  ).map((section) => section.key);
}
