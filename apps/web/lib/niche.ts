// Nisha kashfiyotchisi — ballash mantiqi (TZ 4.0).
// 5 mezon: talab, raqobat zichligi, avtomatlashtirish qulayligi,
// monetizatsiya salohiyati, kontent zaxirasi. Har bir 0..1 oralig'ida,
// ummidiy qiymat hisoblanadi.

export interface NicheScores {
  demand: number; // 0..1 — talab (ko'rinishlar, saqlashlar, ulashishlar)
  competition: number; // 0..1 — raqobat zichligi (kamroq = yaxshiroq)
  automation: number; // 0..1 — avtomatlashtirish qulayligi
  monetization: number; // 0..1 — monetizatsiya salohiyati
  contentReserve: number; // 0..1 — kontent zaxirasi (mavzuga doimo materiaal bor)
  total: number; // 0..1 — yig'indiy ball (ag'arroq o'rta)
}

export interface NicheCandidateInput {
  niche: string;
  source: string;
  /** Manbadan kelgan signallar (qidiruv hajmi, videolar soni, vaqti o'tgan muddat, etc). */
  signals: Record<string, unknown>;
}

function numSignal(
  signals: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const raw = signals[key];
  if (raw == null || typeof raw !== "number") return fallback;
  return Number.isFinite(raw) ? raw : fallback;
}

/**
 * 5-mezonli ballash. Funksiya aniq va deterministik — test qilinadi.
 *
 * Qoidalar:
 * - demand: ko'p qidiruv / ko'p video = yuqori talab
 * - competition: ko'p raqobatchi = past ball (yaxshiroq bo'lmasin)
 * - automation: matn + ovoz + stock rasm bilan qadasin video = qulay
 * - monetization: reklama / affiliate / o'z mahsulot imkoniyati
 * - contentReserve: mavzuga doimo yangi kontent chiqarilishi mumkin
 */
export function scoreNiche(input: NicheCandidateInput): NicheScores {
  const { signals } = input;

  const clamp = (v: number): number => Math.max(0, Math.min(1, v));

  // Talab: signallardan 'interest' yoki 'views' asosida.
  const demand = clamp(
    numSignal(signals, "interest", numSignal(signals, "views", 0.5)),
  );

  // Raqobat zichligi: signallardan 'competition' yoki 'videoCount' asosida.
  // Ko'p video = yuqori raqobat = past ball. Invert qilamiz.
  const competition = clamp(
    1 - numSignal(signals, "competition", numSignal(signals, "videoCount", 0.5)),
  );

  // Avtomatlashtirish qulayligi: matn+ovoz+rasm avtomatik qadasin (default 0.7).
  const automation = clamp(numSignal(signals, "automation", 0.7));

  // Monetizatsiya: reklama / affiliate / o'z mahsulot (default 0.6).
  const monetization = clamp(numSignal(signals, "monetization", 0.6));

  // Kontent zaxirasi: mavzuga doimo yangi kontent (default 0.5).
  const contentReserve = clamp(numSignal(signals, "contentReserve", 0.5));

  // Yig'indiy ball: har bir mezon teng ahamiyatda (0.2 x 5).
  const total =
    (demand + competition + automation + monetization + contentReserve) / 5;

  return {
    demand: Math.round(demand * 100) / 100,
    competition: Math.round(competition * 100) / 100,
    automation: Math.round(automation * 100) / 100,
    monetization: Math.round(monetization * 100) / 100,
    contentReserve: Math.round(contentReserve * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/** Ballni baholangcha so'zda izohlaydi. */
export function scoreLabel(total: number): string {
  if (total >= 0.8) return "Ajonat";
  if (total >= 0.65) return "Yaxshi";
  if (total >= 0.5) return "O'rta";
  if (total >= 0.35) return "Kam";
  return "Juda kam";
}

export function isWinnerThreshold(total: number): boolean {
  return total >= 0.65;
}
