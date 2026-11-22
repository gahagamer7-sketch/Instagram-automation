// Nisha kashfiyoti uchun signal provayderlari — TZ 4.0.
// Har provayder adapter interfeysini amalga oshiradi va provider bilan bog'liq
// mantlani yopiq saqlaydi. Kalit yo'q bo'lsa xatolikni yutadi va bo'sh ro'yxat
// qaytaradi (graceful degradation).

export interface TrendSignal {
  /** So'rov / mavzu nomi. */
  query: string;
  /** Manba: trends | youtube | telegram | llm. */
  source: "trends" | "youtube" | "telegram" | "llm";
  /** 0..1 oralig'ida query qiziqlish darajasi (manbaga qarab normalizatsiya qilingan). */
  interest: number;
  /** Qo'shimcha ma'lumotlar (manba-specifik). */
  meta: Record<string, unknown>;
  /** Signal qabul qilingan vaqt. */
  fetchedAt: string;
}

/** Barcha provayderlar uchun umumiy xatolik turi. */
export class IntegrationError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

/** YouTube Data API v3 — mostPopular videolar (regionCode=UZ). */
export class YouTubeProvider {
  private readonly apiKey?: string;
  private readonly base = "https://www.googleapis.com/youtube/v3";

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async mostPopular({
    regionCode = "UZ",
    maxResults = 25,
    videoCategoryId,
  }: {
    regionCode?: string;
    maxResults?: number;
    videoCategoryId?: string;
  } = {}): Promise<TrendSignal[]> {
    if (!this.apiKey) {
      throw new IntegrationError(
        "YouTube API kaliti kiritilmagan",
        "youtube",
      );
    }

    const params = new URLSearchParams({
      part: "snippet,statistics",
      chart: "mostPopular",
      regionCode,
      maxResults: String(maxResults),
      key: this.apiKey,
      ...(videoCategoryId ? { videoCategoryId } : {}),
    });

    const res = await fetch(`${this.base}/videos?${params}`, {
      headers: { Accept: "application/json" },
      // YouTube Data API cheklangan — qisqa timeout.
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new IntegrationError(
        `YouTube so'rovi xatosi (${res.status}): ${text.slice(0, 200)}`,
        "youtube",
        res.status,
      );
    }

    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet: { title: string; channelTitle: string };
        statistics?: { viewCount?: string };
      }>;
      pageInfo?: { totalResults?: number };
    };

    const signals: TrendSignal[] = (data.items ?? []).map((item) => {
      const views = Number(item.statistics?.viewCount ?? 0);
      // Ko'rinishlar sonini 0..1 oralig'iga laslashtirish (logaritmik).
      const interest = views > 0 ? Math.min(1, Math.log10(views + 1) / 8) : 0;
      return {
        query: item.snippet.title,
        source: "youtube",
        interest,
        meta: {
          videoId: item.id,
          channel: item.snippet.channelTitle,
          views,
          regionCode,
        },
        fetchedAt: new Date().toISOString(),
      };
    });

    return signals.sort((a, b) => b.interest - a.interest);
  }

  /** Kalit mavjudligini tekshiradi (yengil so'rov). */
  async checkConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: "YouTube API kaliti kiritilmagan" };
    }
    try {
      await this.mostPopular({ maxResults: 1 });
      return { ok: true, message: "YouTube Data API ulandi" };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

/** Google Trends — reserved provider (rasm/HTML scraping yo'q, TZ 4.0). */
export class GoogleTrendsProvider {
  async relatedQueries(
    _query: string,
  ): Promise<{ top: string[]; rising: string[] }> {
    // Google Trends uchun ochiq official API yo'q. Reja B sifatida LLM orqali
    // nomzodlarni generatsiya qilishga o'tiladi.
    return { top: [], rising: [] };
  }

  async checkConnection(): Promise<{ ok: boolean; message: string }> {
    return {
      ok: false,
      message:
        "Google Trends uchun ochiq official API yo'q; nomzodlar LLM orqali generatsiya qilinadi.",
    };
  }
}

export * from "./instagram";

