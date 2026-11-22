import { describe, expect, it } from "vitest";
import {
  SKILL_MAX_CHARS,
  SKILL_MIN_CHARS,
  missingSkillSections,
  validateSkillText,
} from "./skill-text";

const LONG_ENOUGH = "a".repeat(SKILL_MIN_CHARS);

describe("validateSkillText", () => {
  it("bo'sh matnni rad etadi", () => {
    const result = validateSkillText("   \n\t  ");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("bo'sh");
  });

  it("qisqa matnni belgi soni bilan rad etadi", () => {
    const result = validateSkillText("qisqa matn");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("juda qisqa");
  });

  it("juda uzun matnni rad etadi", () => {
    const result = validateSkillText("a".repeat(SKILL_MAX_CHARS + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("juda uzun");
  });

  it("minimal uzunlikdagi matnni qabul qiladi", () => {
    const result = validateSkillText(LONG_ENOUGH);
    expect(result.ok).toBe(true);
  });

  it("CRLF ni normallashtiradi va bo'shliqlarni kesadi", () => {
    const result = validateSkillText(`\r\n  ${LONG_ENOUGH}  \r\n`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).not.toContain("\r");
      expect(result.text).toBe(LONG_ENOUGH);
    }
  });
});

describe("missingSkillSections", () => {
  it("tuzilma, uslub va taqiq bo'limlarini topadi", () => {
    const text = "Bu skill tuzilmasi va uslubi haqida. Taqiqlar ham bor.";
    expect(missingSkillSections(text)).toEqual([]);
  });

  it("yetishmayotgan bo'limlarni qaytaradi", () => {
    const missing = missingSkillSections("Faqat umumiy matn, hech qanday bo'lim yo'q.");
    expect(missing).toContain("tuzilma");
    expect(missing).toContain("uslub");
    expect(missing).toContain("taqiq");
  });

  it("katta-kichik harfga bog'liq emas", () => {
    expect(missingSkillSections("TUZILMA USLUB TAQIQ")).toEqual([]);
  });
});
