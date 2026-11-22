// Pexels stock video va foto provayderi — TZ 4.4 & TZ 9.
import { IntegrationError } from "./index";

export interface PexelsVideoFile {
  id: number;
  quality: string;
  fileType: string;
  width: number;
  height: number;
  link: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  videoFiles: PexelsVideoFile[];
}

export class PexelsProvider {
  private readonly apiKey?: string;
  private readonly baseUrl = "https://api.pexels.com";

  constructor(apiKey?: string) {
    this.apiKey = apiKey?.trim();
  }

  /**
   * Pexels API kaliti to'g'riligini tekshiradi (curated so'rovi orqali).
   */
  async checkConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: "Pexels API kaliti kiritilmagan" };
    }

    try {
      const res = await fetch(`${this.baseUrl}/v1/curated?per_page=1`, {
        headers: { Authorization: this.apiKey },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        return { ok: false, message: `Pexels API xatosi (${res.status})` };
      }

      return { ok: true, message: "Pexels API muvaffaqiyatli ulandi" };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Vertikal (9:16 portrait) stock videolarni qidiradi.
   * Xatolik bo'lsa graceful fallback sifatida bo'sh massiv qaytaradi.
   */
  async searchVerticalVideos(query: string, perPage = 3): Promise<PexelsVideo[]> {
    if (!this.apiKey) return [];

    try {
      const url = `${this.baseUrl}/videos/search?query=${encodeURIComponent(
        query,
      )}&orientation=portrait&per_page=${perPage}`;

      const res = await fetch(url, {
        headers: { Authorization: this.apiKey },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) return [];

      const data = (await res.json()) as {
        videos?: Array<{
          id: number;
          width: number;
          height: number;
          url: string;
          image: string;
          duration: number;
          video_files?: Array<{
            id: number;
            quality: string;
            file_type: string;
            width: number;
            height: number;
            link: string;
          }>;
        }>;
      };

      return (data.videos ?? []).map((v) => ({
        id: v.id,
        width: v.width,
        height: v.height,
        url: v.url,
        image: v.image,
        duration: v.duration,
        videoFiles: (v.video_files ?? []).map((f) => ({
          id: f.id,
          quality: f.quality,
          fileType: f.file_type,
          width: f.width,
          height: f.height,
          link: f.link,
        })),
      }));
    } catch {
      return [];
    }
  }
}

