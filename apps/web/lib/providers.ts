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
  /** "Ulanishni tekshirish" qo'llab-quvvatlanadimi. */
  testable: boolean;
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "gemini",
    label: "Gemini (AI va Ovoz TTS)",
    description:
      "Ssenariy va tabiiy o'zbekcha diktor ovozi (TTS) generatsiyasi uchun asosiy shaxsiy kalitingiz.",
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
    label: "Pexels (Fon Video va Rasmlar)",
    description: "Videolar uchun bepul vertikal stock video va rasmlar (ixtiyoriy).",
    keyLabel: "Pexels API kaliti",
    docsUrl: "https://www.pexels.com/api/",
    docsLabel: "pexels.com/api",
    testable: true,
  },
];

export function providerMeta(id: string): ProviderMeta | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
