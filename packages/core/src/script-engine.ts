import type { AiProvider } from "@autochannel/ai";

export interface SceneCue {
  id: number;
  timeRange: string; // masalan: "0-3s", "3-15s", "15-30s", "30-45s"
  type: "hook" | "body" | "cta";
  spokenText: string; // Gemini TTS o'qiydigan matn (o'zbekcha)
  screenText: string; // Ekrandagi qisqa yozuv (subtitr/sarlavha)
  visualDirection: string; // Kadrdagi vizual harakat / fon tasviri
}

export interface ReelsScript {
  title: string;
  hook: string; // 0-3 soniyalik viral hook
  body: string; // Asosiy qiymat beruvchi qism
  cta: string; // Harakatga chaqiruv (obuna bo'lish, saqlash)
  shotList: SceneCue[];
  fullVoiceText: string; // TTS uchun to'liq birlashgan ovozli matn
  captions: {
    short: string;
    engaging: string;
    storytelling: string;
  };
  hashtags: string[];
  estimatedDurationSec: number;
}

export interface ScriptGenerationInput {
  topic: string;
  niche: string;
  skillText?: string;
  targetDurationSec?: number; // standart: 30-45s
}

/**
 * Gemini LLM uchun qat'iy ssenariy promptini shakllantiradi.
 */
export function buildScriptPrompt(input: ScriptGenerationInput): string {
  const { topic, niche, skillText, targetDurationSec = 35 } = input;
  const skillSection = skillText
    ? `\n\n--- VIDEO YARATISH QOIDALARI (FAOL SKILL) ---\n${skillText}\n--- SKILL TUGADI ---\n`
    : "";

  return [
    `Sen professional Instagram Reels ssenariynavis va virusli kontent bo'yicha mutaxassisisan.`,
    `Nisha: "${niche}"`,
    `Reels mavzusi: "${topic}"`,
    `Maqsadli davomiylik: taxminan ${targetDurationSec} soniya.`,
    `Auditoriya: O'zbekiston yoshlari (18-35 yosh), o'zbek tilida (lotin yozuvi).`,
    skillSection,
    ``,
    `MUHIM TALABLAR:`,
    `1. Hook (0-3 soniya): tomoshabinni birinchi 3 soniyada to'xtatadigan qiziqarli savol yoki kutilmagan fakt.`,
    `2. Asosiy qism: ixcham, aniq, amaliy 2-3 ta asosiy fikr (suvli gaplarsiz).`,
    `3. CTA (yakun): "Fikringizni izohlarda yozing", "Do'stingizga yuboring" yoki "Keyingi qism uchun obuna bo'ling".`,
    `4. Ekran matnlari: qisqa, 3-6 so'zdan oshmasin.`,
    `5. Ovozli matn: tabiiy o'zbek tilida, talaffuz qilishga qulay.`,
    `6. 3 xil caption varianti (qisqa, interaktiv, hikoya).`,
    `7. 5-8 ta nishaga oid hashtag.`,
    ``,
    `Faqat quyidagi JSON strukturasini qaytar:`,
    `{`,
    `  "title": "${topic}",`,
    `  "hook": "0-3 soniya hook matni",`,
    `  "body": "Asosiy qism matni",`,
    `  "cta": "Harakatga chaqiruv matni",`,
    `  "shotList": [`,
    `    {`,
    `      "id": 1,`,
    `      "timeRange": "0-3s",`,
    `      "type": "hook",`,
    `      "spokenText": "...",`,
    `      "screenText": "...",`,
    `      "visualDirection": "..."`,
    `    },`,
    `    {`,
    `      "id": 2,`,
    `      "timeRange": "3-15s",`,
    `      "type": "body",`,
    `      "spokenText": "...",`,
    `      "screenText": "...",`,
    `      "visualDirection": "..."`,
    `    },`,
    `    {`,
    `      "id": 3,`,
    `      "timeRange": "15-30s",`,
    `      "type": "body",`,
    `      "spokenText": "...",`,
    `      "screenText": "...",`,
    `      "visualDirection": "..."`,
    `    },`,
    `    {`,
    `      "id": 4,`,
    `      "timeRange": "30-40s",`,
    `      "type": "cta",`,
    `      "spokenText": "...",`,
    `      "screenText": "...",`,
    `      "visualDirection": "..."`,
    `    }`,
    `  ],`,
    `  "captions": {`,
    `    "short": "Qisqa post matni",`,
    `    "engaging": "Savolli interaktiv post matni",`,
    `    "storytelling": "Batafsilroq post matni"`,
    `  },`,
    `  "hashtags": ["#uzbekistan", "#reels", "#${niche.toLowerCase().replace(/\s+/g, "")}"]`,
    `}`,
  ].join("\n");
}

/**
 * Gemini natijasini parslaydi va to'liq ReelsScript obyektini shakllantiradi.
 */
export function parseScriptResponse(rawText: string, fallbackTopic: string): ReelsScript {
  try {
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
      rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
    const data = JSON.parse(jsonStr);

    const shotList: SceneCue[] = Array.isArray(data.shotList) && data.shotList.length > 0
      ? data.shotList.map((c: any, idx: number) => ({
          id: Number(c.id ?? idx + 1),
          timeRange: String(c.timeRange ?? `${idx * 10}-${(idx + 1) * 10}s`),
          type: (c.type === "hook" || c.type === "cta" ? c.type : "body") as "hook" | "body" | "cta",
          spokenText: String(c.spokenText ?? "").trim(),
          screenText: String(c.screenText ?? "").trim(),
          visualDirection: String(c.visualDirection ?? "").trim(),
        }))
      : [
          {
            id: 1,
            timeRange: "0-3s",
            type: "hook",
            spokenText: data.hook || fallbackTopic,
            screenText: fallbackTopic,
            visualDirection: "Diqqatni tortuvchi sarlavha va fon",
          },
          {
            id: 2,
            timeRange: "3-25s",
            type: "body",
            spokenText: data.body || `${fallbackTopic} haqida asosiy ma'lumotlar.`,
            screenText: "Asosiy qism",
            visualDirection: "Tushuntiruvchi grafiklar va mavzuli kadr",
          },
          {
            id: 3,
            timeRange: "25-35s",
            type: "cta",
            spokenText: data.cta || "Do'stlaringiz bilan ulashing va obuna bo'ling!",
            screenText: "Obuna bo'ling!",
            visualDirection: "Pastki profil havolasi va obuna tugmasi",
          },
        ];

    const fullVoiceText = shotList.map((s) => s.spokenText).filter(Boolean).join(" ");
    const words = fullVoiceText.split(/\s+/).filter(Boolean).length;
    // O'rtacha 2.5 so'z / soniya
    const estimatedDurationSec = Math.max(15, Math.min(90, Math.round(words / 2.5)));

    return {
      title: data.title || fallbackTopic,
      hook: data.hook || shotList[0]?.spokenText || fallbackTopic,
      body: data.body || shotList.filter((s) => s.type === "body").map((s) => s.spokenText).join(" "),
      cta: data.cta || shotList[shotList.length - 1]?.spokenText || "Obuna bo'ling!",
      shotList,
      fullVoiceText,
      captions: {
        short: data.captions?.short || `${fallbackTopic} haqida muhim ma'lumotlar. Saqlab qo'ying!`,
        engaging: data.captions?.engaging || `Siz bu haqida bilarmidingiz? Fikringizni izohlarda yozing! 👇`,
        storytelling: data.captions?.storytelling || `${fallbackTopic}.\nBugungi kunda bu mavzu juda dolzarb bo'lib bormoqda. Videoni oxirigacha ko'ring!`,
      },
      hashtags: Array.isArray(data.hashtags) && data.hashtags.length > 0
        ? data.hashtags.map((h: unknown) => String(h).trim())
        : ["#reels", "#foydali", "#toshkent", "#uzbekistan"],
      estimatedDurationSec,
    };
  } catch {
    // Fallback ssenariy
    const shotList: SceneCue[] = [
      {
        id: 1,
        timeRange: "0-3s",
        type: "hook",
        spokenText: `Bu sirni bilmasdan ${fallbackTopic} haqida xulosaga kelmang!`,
        screenText: fallbackTopic,
        visualDirection: "Katta sarlavha va qiziqarli intro",
      },
      {
        id: 2,
        timeRange: "3-20s",
        type: "body",
        spokenText: `${fallbackTopic} har birimiz uchun eng kerakli va amaliy bilimlardan biridir. Har kuni buni qo'llash orqali ajoyib natijaga erishish mumkin.`,
        screenText: "Amaliy foyda",
        visualDirection: "Dinamik infografika va mavzuli stock kadrlari",
      },
      {
        id: 3,
        timeRange: "20-30s",
        type: "cta",
        spokenText: "Yangi foydali videolarni o'tkazib yubormaslik uchun profilimizga obuna bo'ling!",
        screenText: "Obuna bo'ling 👇",
        visualDirection: "CTA animatsiyasi va profil belgisi",
      },
    ];

    const fullVoiceText = shotList.map((s) => s.spokenText).join(" ");
    return {
      title: fallbackTopic,
      hook: shotList[0]!.spokenText,
      body: shotList[1]!.spokenText,
      cta: shotList[2]!.spokenText,
      shotList,
      fullVoiceText,
      captions: {
        short: `${fallbackTopic} haqida yangi video! Saqlab qo'ying.`,
        engaging: `Siz ${fallbackTopic} haqida nima deb o'ylaysiz? Fikringizni izohlarda qoldiring! 👇`,
        storytelling: `${fallbackTopic} haqida ko'pchilik bilmaydigan haqiqatlar. Batafsil videoda!`,
      },
      hashtags: ["#reels", "#uzb", "#foydali", "#tavsiya"],
      estimatedDurationSec: 30,
    };
  }
}

/**
 * Gemini orqali to'liq Reels ssenariysini generatsiya qiladi.
 */
export async function generateReelsScript(
  provider: AiProvider,
  input: ScriptGenerationInput,
): Promise<ReelsScript> {
  const prompt = buildScriptPrompt(input);
  const result = await provider.generateText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 2000,
  });

  return parseScriptResponse(result.text, input.topic);
}
