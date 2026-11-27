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
      "Ssenariy, g'oyalar va o'zbekcha ovoz (TTS). Tizimning asosiy AI va ovoz kaliti.",
    keyLabel: "Gemini API kaliti",
    docsUrl: "https://aistudio.google.com/apikey",
    docsLabel: "aistudio.google.com",
    testable: true,
  },
  {
    id: "groq",
    label: "Groq (AI — Ultra Tezkor)",
    description:
      "API kalitingizdagi mavjud eng yaxshi modelni avtomatik aniqlab, ssenariylarni chaqmoqdek tezkor generatsiya qiladi.",
    keyLabel: "Groq API kaliti",
    docsUrl: "https://console.groq.com/keys",
    docsLabel: "console.groq.com",
    testable: true,
  },
  {
    id: "pexels",
    label: "Pexels",
    description: "Bepul stock video va rasmlar.",
    keyLabel: "Pexels API kaliti",
    docsUrl: "https://www.pexels.com/api/",
    docsLabel: "pexels.com/api",
    testable: true,
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
