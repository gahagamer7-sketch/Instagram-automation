// Brend generatori mantiqi — TZ 4.1.
// 10 nom varianti, slogan, bio (150 belgigacha), kalit so'zlar,
// ranglar palitrasi, 4 ta SVG avatar (1080x1080) va Reels muqova shabloni (1080x1920).

export interface BrandColors {
  primary: string;
  primaryHover: string;
  accentIndigo: string;
  accentCyan: string;
  bgDark: string;
  surface: string;
  textLight: string;
}

export interface BrandKitData {
  nameOptions: string[];
  chosenName: string;
  slogan: string;
  bio: string;
  keywords: string[];
  colors: BrandColors;
  font: string;
  voiceId: string;
  avatars: string[]; // 4 SVG string (1080x1080)
  coverTemplate: string; // 1 SVG string (1080x1920)
}

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#3B82F6",
  primaryHover: "#2563EB",
  accentIndigo: "#6366F1",
  accentCyan: "#22D3EE",
  bgDark: "#0B1220",
  surface: "#111B2E",
  textLight: "#E6EDF7",
};

/**
 * 1080x1080 o'lchamli toza vektorli SVG avatar yaratadi.
 * Gemini rasm generatsiyasida bepul tarifda 429 xatoligi bo'lgani uchun
 * SVG avatar generatori barqaror va yuqori sifatli vizual yechimdir.
 */
export function generateAvatarSvg(
  variant: number,
  name: string,
  colors: BrandColors = DEFAULT_BRAND_COLORS,
): string {
  const cleanName = (name || "AC").trim();
  const initials = cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "AC";

  switch (variant) {
    case 1:
      // Variant 1: Geometrik zamonaviy monogramma (gradient halqali)
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgDark}" />
      <stop offset="100%" stop-color="${colors.surface}" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.accentCyan}" />
      <stop offset="50%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.accentIndigo}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="1080" height="1080" fill="url(#g1)" />
  <circle cx="540" cy="540" r="420" fill="none" stroke="url(#ringGrad)" stroke-width="24" filter="url(#glow)" />
  <circle cx="540" cy="540" r="360" fill="${colors.surface}" fill-opacity="0.7" />
  <text x="540" y="590" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="800" font-size="210" fill="${colors.textLight}" letter-spacing="4">
    ${initials}
  </text>
  <text x="540" y="690" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="600" font-size="42" fill="${colors.accentCyan}" letter-spacing="8">
    ${cleanName.toUpperCase().slice(0, 18)}
  </text>
</svg>`;

    case 2:
      // Variant 2: Minimalist nurlanuvchi neon emblem
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bgG" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#050811" />
      <stop offset="100%" stop-color="${colors.bgDark}" />
    </linearGradient>
    <linearGradient id="shapeG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.accentCyan}" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bgG)" />
  <rect x="180" y="180" width="720" height="720" rx="200" fill="url(#shapeG)" opacity="0.15" />
  <rect x="220" y="220" width="640" height="640" rx="160" fill="none" stroke="url(#shapeG)" stroke-width="16" />
  <circle cx="540" cy="540" r="180" fill="${colors.primary}" opacity="0.25" />
  <text x="540" y="605" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="900" font-size="240" fill="${colors.textLight}">
    ${initials}
  </text>
</svg>`;

    case 3:
      // Variant 3: 3D uslubidagi sfera va aksent halqa
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${colors.accentCyan}" />
      <stop offset="40%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="#0F172A" />
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="${colors.bgDark}" />
  <circle cx="540" cy="540" r="350" fill="url(#sphereGrad)" />
  <ellipse cx="540" cy="540" rx="460" ry="160" fill="none" stroke="${colors.accentIndigo}" stroke-width="14" transform="rotate(-25 540 540)" opacity="0.8" />
  <text x="540" y="595" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="800" font-size="190" fill="#FFFFFF">
    ${initials}
  </text>
</svg>`;

    default:
      // Variant 4: Texnologik toza heksagon / emblem
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.accentIndigo}" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="${colors.bgDark}" />
  <polygon points="540,140 900,340 900,740 540,940 180,740 180,340" fill="${colors.surface}" stroke="url(#hexGrad)" stroke-width="20" />
  <text x="540" y="590" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="900" font-size="220" fill="${colors.textLight}">
    ${initials}
  </text>
  <text x="540" y="680" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="500" font-size="38" fill="${colors.accentCyan}" letter-spacing="4">
    OFFICIAL
  </text>
</svg>`;
  }
}

/**
 * 1080x1920 (9:16) o'lchamli Reels muqova shablonini generatsiya qiladi.
 */
export function generateCoverSvg(
  name: string,
  slogan: string,
  colors: BrandColors = DEFAULT_BRAND_COLORS,
): string {
  const cleanName = (name || "AutoChannel").trim();
  const cleanSlogan = (slogan || "Har kuni yangi bilim").trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="coverBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgDark}" />
      <stop offset="60%" stop-color="#0e1726" />
      <stop offset="100%" stop-color="${colors.surface}" />
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.accentCyan}" />
      <stop offset="50%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.accentIndigo}" />
    </linearGradient>
  </defs>

  <rect width="1080" height="1920" fill="url(#coverBg)" />

  <!-- Yuqori brend belgisi (SafeArea) -->
  <rect x="80" y="140" width="340" height="80" rx="40" fill="${colors.surface}" stroke="${colors.primary}" stroke-width="3" />
  <text x="250" y="192" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="700" font-size="32" fill="${colors.textLight}">
    @${cleanName.toLowerCase().replace(/\s+/g, "")}
  </text>

  <!-- Markaziy sarlavha bloki -->
  <rect x="60" y="760" width="960" height="400" rx="36" fill="${colors.surface}" fill-opacity="0.85" stroke="#1E293B" stroke-width="4" />
  <rect x="120" y="800" width="160" height="10" rx="5" fill="url(#accentLine)" />

  <text x="120" y="890" font-family="'Inter', sans-serif" font-weight="900" font-size="64" fill="${colors.textLight}">
    REELS MAVZUSI SHU YERDA
  </text>
  <text x="120" y="970" font-family="'Inter', sans-serif" font-weight="600" font-size="44" fill="${colors.accentCyan}">
    ${cleanSlogan.slice(0, 40)}
  </text>

  <!-- Pastki CTA qismi -->
  <line x1="80" y1="1680" x2="1000" y2="1680" stroke="url(#accentLine)" stroke-width="6" />
  <text x="540" y="1760" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="700" font-size="38" fill="${colors.textLight}">
    Obuna bo'ling • Saqlab qo'ying
  </text>
</svg>`;
}

/**
 * Gemini LLM dan qaytgan brend taklifini tozalab JSON formatga o'tkazadi.
 */
export function parseBrandKitResponse(
  rawText: string,
  niche: string,
): BrandKitData {
  try {
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
      rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawText;
    const parsed = JSON.parse(jsonStr);

    const nameOptions: string[] = Array.isArray(parsed.nameOptions)
      ? parsed.nameOptions.filter((n: unknown) => typeof n === "string" && n.trim().length > 0)
      : [
          `${niche} Pro`,
          `${niche} Uz`,
          `${niche} Daily`,
          `${niche} Hub`,
          `Fokus ${niche}`,
        ];

    const chosenName = (parsed.chosenName || nameOptions[0] || `${niche} Uz`).trim();
    const slogan = (parsed.slogan || "Har kuni yangi va qiziqarli videolar").trim();
    const bio = (parsed.bio || `🔥 ${niche} bo'yicha eng sara Reels videolar\n💡 Kundalik foydali ma'lumotlar\n👇 Obuna bo'ling!`).slice(0, 150);
    const keywords: string[] = Array.isArray(parsed.keywords)
      ? parsed.keywords.map((k: unknown) => String(k).trim())
      : [`#${niche.toLowerCase().replace(/\s+/g, "_")}`, "#uzbekistan", "#reels"];

    const colors: BrandColors = {
      ...DEFAULT_BRAND_COLORS,
      ...(parsed.colors || {}),
    };

    const font = parsed.font || "Inter";
    const voiceId = parsed.voiceId || "gemini-uz-natural-male";

    return {
      nameOptions: nameOptions.slice(0, 10),
      chosenName,
      slogan,
      bio,
      keywords,
      colors,
      font,
      voiceId,
      avatars: [1, 2, 3, 4].map((v) => generateAvatarSvg(v, chosenName, colors)),
      coverTemplate: generateCoverSvg(chosenName, slogan, colors),
    };
  } catch {
    // Agar parsing xato bo'lsa standart barqaror shablon qaytariladi
    const defaultName = `${niche} Uz`;
    return {
      nameOptions: [
        `${niche} Uz`,
        `${niche} Pro`,
        `${niche} Daily`,
        `${niche} Hub`,
        `Fokus ${niche}`,
        `${niche} Studio`,
        `${niche} Life`,
        `${niche} Plus`,
        `Biznes ${niche}`,
        `Master ${niche}`,
      ],
      chosenName: defaultName,
      slogan: "Har kuni foydali va qiziqarli ma'lumotlar",
      bio: `🔥 ${niche} olamidagi eng muhim tavsiyalar\n💡 Kundalik o'rganish va rivojlanish\n👇 Bizga qo'shiling!`.slice(0, 150),
      keywords: [`#${niche.toLowerCase().replace(/\s+/g, "_")}`, "#uzb", "#reels", "#foydali"],
      colors: DEFAULT_BRAND_COLORS,
      font: "Inter",
      voiceId: "gemini-uz-natural-male",
      avatars: [1, 2, 3, 4].map((v) => generateAvatarSvg(v, defaultName, DEFAULT_BRAND_COLORS)),
      coverTemplate: generateCoverSvg(defaultName, "Har kuni yangi bilim", DEFAULT_BRAND_COLORS),
    };
  }
}

/** LLM uchun brend generatsiya qilish bo'yicha prompt yaratadi */
export function buildBrandPrompt(niche: string, skillText?: string): string {
  const skillPart = skillText
    ? `\nKanal formati va qoidalari (Skill):\n${skillText.slice(0, 1500)}`
    : "";

  return [
    `Sen Instagram kanallari uchun professional brend mutaxassisisan.`,
    `Nisha: "${niche}".`,
    `Auditoriya: O'zbekiston yoshlari (18-35 yosh), o'zbek tili (lotin yozuvi).`,
    skillPart,
    ``,
    `Quyidagi talablar bo'yicha JSON formatida brend paketini tayyorla:`,
    `1. nameOptions: 10 ta o'ziga jalb qiluvchi, qisqa va zamonaviy nom variantlari.`,
    `2. chosenName: ulardan eng kuchli 1-nom.`,
    `3. slogan: qisqa, jarangdor shior (3-6 so'z).`,
    `4. bio: Instagram profili uchun bio matni (aniq 150 belgidan oshmasin, emoji bilan, qiymat va CTA).`,
    `5. keywords: 5-8 ta nishaga mos hashtag/kalit so'z.`,
    `6. font: zamonaviy shrift nomi (masalan: "Inter" yoki "Manrope").`,
    `7. voiceId: ovoz turi ("gemini-uz-natural-male" yoki "gemini-uz-natural-female").`,
    ``,
    `Faqat quyidagi JSON strukturasini qaytar:`,
    `{`,
    `  "nameOptions": ["...", "..."],`,
    `  "chosenName": "...",`,
    `  "slogan": "...",`,
    `  "bio": "...",`,
    `  "keywords": ["#...", "#..."],`,
    `  "font": "Inter",`,
    `  "voiceId": "gemini-uz-natural-male"`,
    `}`,
  ].join("\n");
}

