import { describe, expect, it } from "vitest";
import {
  parseScriptResponse,
  buildScriptPrompt,
  validateScriptQa,
  parsePlannerResponse,
  buildPlannerPrompt,
  buildAssSubtitles,
  FORBIDDEN_WORDS,
} from "./index";

describe("Script Engine", () => {
  it("JSON javobini to'liq ReelsScript shaklida parslaydi", () => {
    const raw = JSON.stringify({
      title: "Vaqtni boshqarish",
      hook: "Har kuni 2 soat vaqtingiz behuda ketayotganini bilarmidingiz?",
      body: "Pomodoro texnikasi va 2 daqiqa qoidasini qo'llang.",
      cta: "Ko'proq foydali maslahatlar uchun obuna bo'ling!",
      shotList: [
        { id: 1, timeRange: "0-3s", type: "hook", spokenText: "Diqqat!", screenText: "Diqqat", visualDirection: "Kadr" },
        { id: 2, timeRange: "3-20s", type: "body", spokenText: "Asosiy qism", screenText: "Matn", visualDirection: "Kadr" },
        { id: 3, timeRange: "20-30s", type: "cta", spokenText: "Obuna bo'ling", screenText: "CTA", visualDirection: "Kadr" },
      ],
      captions: {
        short: "Qisqa post",
        engaging: "Fikringizni yozing",
        storytelling: "Tafsilotlar",
      },
      hashtags: ["#reels", "#vaqt"],
    });

    const script = parseScriptResponse(raw, "Vaqtni boshqarish");
    expect(script.title).toBe("Vaqtni boshqarish");
    expect(script.hook).toContain("2 soat");
    expect(script.shotList).toHaveLength(3);
    expect(script.estimatedDurationSec).toBeGreaterThanOrEqual(15);
  });

  it("buzilgan matn kelganda xavfsiz fallback ssenariy qaytaradi", () => {
    const script = parseScriptResponse("Buzilgan javob matni", "Fokus");
    expect(script.title).toBe("Fokus");
    expect(script.shotList.length).toBeGreaterThanOrEqual(3);
    expect(script.captions.short).toBeDefined();
  });

  it("buildScriptPrompt skill matnini o'z ichiga oladi", () => {
    const prompt = buildScriptPrompt({
      topic: "Odatlar",
      niche: "Rivojlanish",
      skillText: "Standart o'zbek tili talaffuzi",
    });
    expect(prompt).toContain("Odatlar");
    expect(prompt).toContain("Rivojlanish");
    expect(prompt).toContain("Standart o'zbek tili talaffuzi");
  });
});

describe("QA Rules & Safety", () => {
  it("to'liq sifatli ssenariydan muvaffaqiyatli QA o'tadi", () => {
    const script = {
      title: "Muvaffaqiyat odati",
      hook: "Har kuni ertalab 10 daqiqa kitob o'qish sizni qanday o'zgartiradi?",
      body: "Bu usul miya faoliyatini 30% ga oshiradi va diqqatni jamlashga yordam beradi.",
      cta: "Foydali bo'lsa do'stingizga yuboring va obuna bo'ling!",
      shotList: [
        { id: 1, timeRange: "0-3s", type: "hook" as const, spokenText: "Har kuni ertalab 10 daqiqa kitob o'qish sizni qanday o'zgartiradi?", screenText: "Kitob kuchi", visualDirection: "Kitob" },
        { id: 2, timeRange: "3-20s", type: "body" as const, spokenText: "Bu usul miya faoliyatini 30% ga oshiradi va diqqatni jamlashga yordam beradi.", screenText: "Miya quvvati", visualDirection: "Grafik" },
        { id: 3, timeRange: "20-30s", type: "cta" as const, spokenText: "Foydali bo'lsa do'stingizga yuboring va obuna bo'ling!", screenText: "Obuna bo'ling", visualDirection: "CTA" },
      ],
      fullVoiceText: "Har kuni ertalab 10 daqiqa kitob o'qish sizni qanday o'zgartiradi? Bu usul miya faoliyatini 30 foizga oshiradi va diqqatni jamlashga yordam beradi. Foydali bo'lsa do'stingizga yuboring va obuna bo'ling!",
      captions: { short: "Kitob o'qing", engaging: "Fikr yozing", storytelling: "Hikoya" },
      hashtags: ["#kitob"],
      estimatedDurationSec: 30,
    };

    const qa = validateScriptQa(script);
    expect(qa.passed).toBe(true);
    expect(qa.score).toBeGreaterThanOrEqual(0.7);
    expect(qa.violations).toHaveLength(0);
  });

  it("taqiqlangan so'zlar aniqlanganda QA'ni to'xtatadi", () => {
    const dangerousScript = {
      title: "Oson pul",
      hook: "1xbet orqali qimor o'ynab boyib ketish siri!",
      body: "Oddiy stavka bilan million yutib oling.",
      cta: "Kanalga obuna bo'ling!",
      shotList: [
        { id: 1, timeRange: "0-3s", type: "hook" as const, spokenText: "1xbet qimor siri", screenText: "Qimor", visualDirection: "Pul" },
        { id: 2, timeRange: "3-20s", type: "body" as const, spokenText: "Stavka qiling", screenText: "Stavka", visualDirection: "O'yin" },
        { id: 3, timeRange: "20-30s", type: "cta" as const, spokenText: "Obuna bo'ling", screenText: "CTA", visualDirection: "CTA" },
      ],
      fullVoiceText: "1xbet orqali qimor o'ynab boyib ketish siri!",
      captions: { short: "Pul", engaging: "Fikr", storytelling: "Hikoya" },
      hashtags: ["#qimor"],
      estimatedDurationSec: 25,
    };

    const qa = validateScriptQa(dangerousScript);
    expect(qa.passed).toBe(false);
    expect(qa.violations.some((v) => v.includes("Taqiqlangan so'zlar"))).toBe(true);
  });
});

describe("Content Planner", () => {
  it("rejalashtirilgan g'oyalar ro'yxatini to'g'ri parslaydi", () => {
    const raw = JSON.stringify([
      { topic: "Mavzu 1", hookPremise: "Hook 1", category: "Tavsiya", dayOffset: 1 },
      { topic: "Mavzu 2", hookPremise: "Hook 2", category: "Fakt", dayOffset: 2 },
    ]);

    const ideas = parsePlannerResponse(raw, "Biznes", 2);
    expect(ideas).toHaveLength(2);
    expect(ideas[0]!.topic).toBe("Mavzu 1");
    expect(ideas[0]!.category).toBe("Tavsiya");
  });

  it("planner prompti nishani o'z ichiga oladi", () => {
    const prompt = buildPlannerPrompt("Sun'iy Intellekt", undefined, 10);
    expect(prompt).toContain("Sun'iy Intellekt");
    expect(prompt).toContain("10 ta");
  });
});

describe("FFmpeg Renderer (ASS Subtitles)", () => {
  it("to'g'ri ASS formatdagi subtitr va brend ma'lumotlarini generatsiya qiladi", () => {
    const shotList = [
      { id: 1, timeRange: "0-3s", type: "hook" as const, spokenText: "Ovoz matni", screenText: "Ekran matni", visualDirection: "Kadr" },
      { id: 2, timeRange: "3-15s", type: "body" as const, spokenText: "Asosiy", screenText: "Mavzu", visualDirection: "Kadr" },
      { id: 3, timeRange: "15-20s", type: "cta" as const, spokenText: "Obuna bo'ling", screenText: "CTA", visualDirection: "Kadr" },
    ];

    const ass = buildAssSubtitles(shotList, "FokusUz", 20);
    expect(ass).toContain("[Script Info]");
    expect(ass).toContain("PlayResX: 1080");
    expect(ass).toContain("PlayResY: 1920");
    expect(ass).toContain("@fokusuz");
    expect(ass).toContain("Ekran matni");
    expect(ass).toContain("Obuna bo'ling • Saqlab qo'ying");
  });
});

