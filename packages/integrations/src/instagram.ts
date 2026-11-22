// Instagram Graph API provayderi — TZ 4.6 & TZ 9.
// Reels konteyner yaratish, status polling, media_publish va token tekshirish.

import { IntegrationError } from "./index";

export interface IgAccountInfo {
  pageId: string;
  pageName: string;
  igUserId: string;
  igUsername: string;
}

export interface CreateReelsContainerOptions {
  igUserId: string;
  videoUrl: string;
  caption: string;
  coverUrl?: string;
  shareToFeed?: boolean;
}

export class InstagramGraphProvider {
  private readonly accessToken: string;
  private readonly apiVersion = "v21.0";
  private readonly baseUrl: string;

  constructor(accessToken: string) {
    if (!accessToken || accessToken.trim().length === 0) {
      throw new IntegrationError("Instagram Access Token kiritilmagan", "meta");
    }
    this.accessToken = accessToken.trim();
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Tokenning amal qilishini tekshiradi va bog'langan Instagram Business akkauntlarini aniqlaydi.
   */
  async checkConnection(): Promise<{
    ok: boolean;
    message: string;
    accounts?: IgAccountInfo[];
  }> {
    try {
      const url = `${this.baseUrl}/me/accounts?fields=id,name,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(
        this.accessToken,
      )}`;

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });

      const data = (await res.json()) as {
        data?: Array<{
          id: string;
          name: string;
          instagram_business_account?: { id: string; username: string };
        }>;
        error?: { message: string; code: number };
      };

      if (!res.ok || data.error) {
        return {
          ok: false,
          message: data.error?.message || `Meta Graph API xatosi (${res.status})`,
        };
      }

      const accounts: IgAccountInfo[] = [];
      for (const page of data.data ?? []) {
        if (page.instagram_business_account?.id) {
          accounts.push({
            pageId: page.id,
            pageName: page.name,
            igUserId: page.instagram_business_account.id,
            igUsername: page.instagram_business_account.username,
          });
        }
      }

      if (accounts.length === 0) {
        return {
          ok: true,
          message:
            "Meta tokeni to'g'ri, ammo unga bog'langan Instagram Business/Creator akkaunti topilmadi. Facebook sahifaga Instagram akkauntni ulang.",
          accounts: [],
        };
      }

      const names = accounts.map((a) => `@${a.igUsername}`).join(", ");
      return {
        ok: true,
        message: `Instagram Business ulandi: ${names}`,
        accounts,
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * 1-qadam: Reels media konteynerini yaratadi (TZ 4.6).
   * POST /{ig-user-id}/media?media_type=REELS&video_url=...
   */
  async createReelsContainer(options: CreateReelsContainerOptions): Promise<string> {
    const { igUserId, videoUrl, caption, coverUrl, shareToFeed = true } = options;

    const params = new URLSearchParams({
      media_type: "REELS",
      video_url: videoUrl,
      caption,
      share_to_feed: String(shareToFeed),
      access_token: this.accessToken,
    });

    if (coverUrl) {
      params.append("cover_url", coverUrl);
    }

    const res = await fetch(`${this.baseUrl}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(30_000),
    });

    const data = (await res.json()) as { id?: string; error?: { message: string; code: number } };

    if (!res.ok || !data.id) {
      const err = data.error?.message || `Konteyner yaratishda xato (${res.status})`;
      throw new IntegrationError(err, "meta", data.error?.code || res.status);
    }

    return data.id;
  }

  /**
   * 2-qadam: Konteyner holatini tekshiradi (status_code: FINISHED / IN_PROGRESS / ERROR).
   */
  async getContainerStatus(containerId: string): Promise<{
    status: "FINISHED" | "IN_PROGRESS" | "ERROR" | "EXPIRED";
    error?: string;
  }> {
    const url = `${this.baseUrl}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(
      this.accessToken,
    )}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await res.json()) as {
      status_code?: "FINISHED" | "IN_PROGRESS" | "ERROR" | "EXPIRED";
      status?: string;
      error?: { message: string };
    };

    if (!res.ok || data.error) {
      throw new IntegrationError(
        data.error?.message || `Status tekshirishda xato (${res.status})`,
        "meta",
      );
    }

    return {
      status: data.status_code || "IN_PROGRESS",
      error: data.status === "ERROR" ? "Video qayta ishlashda xatolik yuz berdi" : undefined,
    };
  }

  /**
   * Konteyner status_code FINISHED bo'lguncha polling qiladi (maksimal 3 daqiqa).
   */
  async waitForContainerReady(
    containerId: string,
    maxWaitSec = 180,
    intervalMs = 5000,
  ): Promise<boolean> {
    const start = Date.now();

    while ((Date.now() - start) / 1000 < maxWaitSec) {
      const { status, error } = await this.getContainerStatus(containerId);
      if (status === "FINISHED") return true;
      if (status === "ERROR" || status === "EXPIRED") {
        throw new IntegrationError(
          error || `Konteyner holati xatolik bilan yakunlandi: ${status}`,
          "meta",
        );
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new IntegrationError(`Konteyner tayyor bo'lishi vaqti o'tib ketdi (${maxWaitSec}s)`, "meta");
  }

  /**
   * 3-qadam: Tayyor konteynerni Instagram sahifasida e'lon qiladi (media_publish).
   * POST /{ig-user-id}/media_publish?creation_id=...
   */
  async publishMedia(igUserId: string, containerId: string): Promise<string> {
    const params = new URLSearchParams({
      creation_id: containerId,
      access_token: this.accessToken,
    });

    const res = await fetch(`${this.baseUrl}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(30_000),
    });

    const data = (await res.json()) as { id?: string; error?: { message: string; code: number } };

    if (!res.ok || !data.id) {
      const err = data.error?.message || `Media publish qilishda xato (${res.status})`;
      throw new IntegrationError(err, "meta", data.error?.code || res.status);
    }

    return data.id;
  }

  /**
   * Qisqa muddatli tokenni (1 soatlik) 60 kunlik Long-Lived tokenga almashtiradi.
   */
  async exchangeLongLivedToken(
    appId: string,
    appSecret: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const url = `${this.baseUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
      appId,
    )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(
      this.accessToken,
    )}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: { message: string };
    };

    if (!res.ok || !data.access_token) {
      throw new IntegrationError(
        data.error?.message || `Long-lived token almashishda xato (${res.status})`,
        "meta",
      );
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in ?? 5184000, // 60 kun
    };
  }
}

