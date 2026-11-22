import { describe, expect, it } from "vitest";
import {
  generateAvatarSvg,
  generateCoverSvg,
  parseBrandKitResponse,
  buildBrandPrompt,
  DEFAULT_BRAND_COLORS,
} from "./brand";

describe("generateAvatarSvg", () => {
  it("to'g'ri viewBox va SVG teglariga ega 1080x1080 o'lcham qaytaradi", () => {
    for (const variant of [1, 2, 3, 4]) {
      const svg = generateAvatarSvg(variant, "Fokus Uz", DEFAULT_BRAND_COLORS);
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 1080 1080"');
      expect(svg).toContain("</svg>");
      expect(svg).toContain("FU"); // initials
    }
  });

  it("bo'sh nom berilganda standart initsial qaytaradi", () => {
    const svg = generateAvatarSvg(1, "");
    expect(svg).toContain("AC");
  });
});

describe("generateCoverSvg", () => {
  it("to'g'ri 1080x1920 (9:16) formatdagi muqova SVG qaytaradi", () => {
    const svg = generateCoverSvg("Fokus Uz", "Har kuni yangi bilim", DEFAULT_BRAND_COLORS);
    expect(svg).toContain('viewBox="0 0 1080 1920"');
    expect(svg).toContain("@fokusuz");
    expect(svg).toContain("Har kuni yangi bilim");
  });
});

describe("parseBrandKitResponse", () => {
  it("to'g'ri JSON'dan BrandKitData'ni muvaffaqiyatli parslaydi", () => {
    const jsonStr = JSON.stringify({
      nameOptions: ["FokusUz", "Odatshunos", "RivojUz"],
      chosenName: "FokusUz",
      slogan: "Har kuni 1% yaxshiroq",
      bio: "Foydali odatlar va shaxsiy rivojlanish. Har kuni yangi Reels! Obuna bo'ling.",
      keywords: ["#odatlar", "#rivojlanish"],
      font: "Inter",
      voiceId: "gemini-uz-natural-male",
    });

    const parsed = parseBrandKitResponse(jsonStr, "Foydali Odatlar");
    expect(parsed.nameOptions).toHaveLength(3);
    expect(parsed.chosenName).toBe("FokusUz");
    expect(parsed.slogan).toBe("Har kuni 1% yaxshiroq");
    expect(parsed.bio.length).toBeLessThanOrEqual(150);
    expect(parsed.avatars).toHaveLength(4);
    expect(parsed.coverTemplate).toContain('viewBox="0 0 1080 1920"');
  });

  it("markdown block ichida kelgan JSON'ni ham parslay oladi", () => {
    const raw = "```json\n" + JSON.stringify({
      nameOptions: ["Kanal1", "Kanal2"],
      chosenName: "Kanal1",
      slogan: "Shior",
      bio: "Qisqa bio",
      keywords: ["#test"],
    }) + "\n```";

    const parsed = parseBrandKitResponse(raw, "Test");
    expect(parsed.chosenName).toBe("Kanal1");
    expect(parsed.nameOptions).toEqual(["Kanal1", "Kanal2"]);
  });

  it("noto'g'ri matn berilganda barqaror fallback qaytaradi", () => {
    const parsed = parseBrandKitResponse("Not a valid json response at all", "Texnologiya");
    expect(parsed.chosenName).toBe("Texnologiya Uz");
    expect(parsed.nameOptions.length).toBeGreaterThanOrEqual(5);
    expect(parsed.bio.length).toBeLessThanOrEqual(150);
    expect(parsed.avatars).toHaveLength(4);
  });
});

describe("buildBrandPrompt", () => {
  it("nisha va skill kontekstini o'z ichiga oladi", () => {
    const prompt = buildBrandPrompt("Biznes Falsafasi", "Hook 3 soniya bo'lishi shart");
    expect(prompt).toContain("Biznes Falsafasi");
    expect(prompt).toContain("Hook 3 soniya bo'lishi shart");
    expect(prompt).toContain("nameOptions");
  });
});
