import { describe, expect, it } from "vitest";
import { scoreLabel, scoreNiche, isWinnerThreshold } from "./niche";

describe("scoreNiche", () => {
  it("5 mezonni 0..1 oralig'ida qaytaradi", () => {
    const result = scoreNiche({
      niche: "test",
      source: "llm",
      signals: { interest: 0.8, competition: 0.2, automation: 0.9 },
    });

    expect(result.demand).toBeGreaterThanOrEqual(0);
    expect(result.demand).toBeLessThanOrEqual(1);
    expect(result.competition).toBeGreaterThanOrEqual(0);
    expect(result.competition).toBeLessThanOrEqual(1);
    expect(result.automation).toBeGreaterThanOrEqual(0);
    expect(result.automation).toBeLessThanOrEqual(1);
    expect(result.monetization).toBeGreaterThanOrEqual(0);
    expect(result.monetization).toBeLessThanOrEqual(1);
    expect(result.contentReserve).toBeGreaterThanOrEqual(0);
    expect(result.contentReserve).toBeLessThanOrEqual(1);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(1);
  });

  it("eng yuqori total ballni hisoblab beradi", () => {
    const max = scoreNiche({
      niche: "max",
      source: "llm",
      signals: { interest: 1, competition: 0, automation: 1, monetization: 1, contentReserve: 1 },
    });
    expect(max.total).toBe(1);

    const min = scoreNiche({
      niche: "min",
      source: "llm",
      signals: { interest: 0, competition: 1, automation: 0, monetization: 0, contentReserve: 0 },
    });
    expect(min.total).toBe(0);
  });

  it("raqobat zichligini inverslaydi (kam raqobat = yuqori ball)", () => {
    const lowComp = scoreNiche({
      niche: "a",
      source: "llm",
      signals: { competition: 0.1 },
    });
    const highComp = scoreNiche({
      niche: "b",
      source: "llm",
      signals: { competition: 0.9 },
    });
    expect(lowComp.competition).toBeGreaterThan(highComp.competition);
  });

  it("no'malum signal uchun default 0.5 oladi", () => {
    const result = scoreNiche({
      niche: "x",
      source: "llm",
      signals: {},
    });
    expect(result.demand).toBe(0.5);
    expect(result.competition).toBe(0.5);
  });
});

describe("scoreLabel", () => {
  it("ballga mos darajani qaytaradi", () => {
    expect(scoreLabel(0.9)).toBe("Ajonat");
    expect(scoreLabel(0.7)).toBe("Yaxshi");
    expect(scoreLabel(0.6)).toBe("O'rta");
    expect(scoreLabel(0.4)).toBe("Kam");
    expect(scoreLabel(0.2)).toBe("Juda kam");
  });
});

describe("isWinnerThreshold", () => {
  it("0.65 dan yuqori bo'lsa g'olib deb hisoblaydi", () => {
    expect(isWinnerThreshold(0.65)).toBe(true);
    expect(isWinnerThreshold(0.64)).toBe(false);
  });
});
