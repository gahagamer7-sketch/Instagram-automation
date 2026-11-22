/** Provayder metama'lumoti — Sozlamalar sahifasi va test mantiqi uchun. */
export interface ProviderMeta {
  id: string;
  label: string;
  description: string;
  /** Kalit maydonining yorlig'i. */
  keyLabel: string;
  /** Kalitni qayerdan olish mumkin (foydalanuvchi uchun havola). */
  docsUrl?: string;
  docsLabel?: string;
  /** "Ulanishni tekshirish" hozircha qo'llab-quvvatlanadimi. */
  testable: boolean;
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "gemini",
    label: "Gemini (AI)",
    description:
      "Ssenariy, tahlil, g'oyalar va o'zbekcha ovoz (TTS). Tizimning asosiy AI kaliti.",
    keyLabel: "Gemini API kaliti",
    docsUrl: "https://aistudio.google.com/apikey",
    docsLabel: "aistudio.google.com",
    testable: true,
  },
  {
    id: "meta",
    label: "Meta / Instagram",
    description:
      "Instagram Business akkauntni ulash va Reels joylash uchun access token.",
    keyLabel: "Meta / Instagram Access Token",
    docsUrl: "https://developers.facebook.com/apps",
    docsLabel: "developers.facebook.com",
    testable: true,
  },
  {
    id: "youtube",
    label: "YouTube Data",
    description: "Nisha kashfiyotida mostPopular (UZ) signali uchun.",
    keyLabel: "YouTube API kaliti",
    docsUrl: "https://console.cloud.google.com/apis/credentials",
    docsLabel: "console.cloud.google.com",
    testable: true,
  },
  {
    id: "pexels",
    label: "Pexels",
    description: "Bepul stock video va rasmlar.",
    keyLabel: "Pexels API kaliti",
    docsUrl: "https://www.pexels.com/api/",
    docsLabel: "pexels.com/api",
    testable: false,
  },
  {
    id: "telegram",
    label: "Telegram bot",
    description: "Bildirishnomalar va yarim avto rejimda tasdiqlash.",
    keyLabel: "Bot token",
    docsUrl: "https://core.telegram.org/bots#botfather",
    docsLabel: "BotFather",
    testable: true,
  },
];

export function providerMeta(id: string): ProviderMeta | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
