// Instagram Graph API provayderi — TZ 4.6 & TZ 9.
// Reels konteyner yaratish, status polling, media_publish va token tekshirish.

import { IntegrationError } from "./index";

export interface IgAccountInfo {
  pageId: string;
  pageName: string;
  igUserId: string;
  igUsername: string;
  accountType?: string;
  profilePictureUrl?: string;
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  name?: string;
  accountType?: string;
  profilePictureUrl?: string;
}

export interface BuildInstagramOAuthUrlOptions {
  appId: string;
  redirectUri: string;
  configId?: string;
  state?: string;
  scopes?: string[];
  enableFbLogin?: boolean;
  forceAuthentication?: boolean;
}

export interface MetaUnifiedLoginOAuthOptions {
  appId: string;
  configId: string;
  redirectUri: string;
  state?: string;
  apiVersion?: string;
  overrideDefaultResponseType?: boolean;
}

export interface DiscoveredInstagramAccount {
  id: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  businessId?: string;
  pageId?: string;
  discoverySource: "assigned_accounts" | "page_linked" | "direct_node";
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
   * Ham Facebook Graph API, ham Instagram Graph API (Instagram Login for Business) ni qo'llab-quvvatlaydi.
   */
  async checkConnection(): Promise<{
    ok: boolean;
    message: string;
    accounts?: IgAccountInfo[];
  }> {
    try {
      // 1. Birinchi navbatda to'g'ridan-to'g'ri Instagram Graph API orqali tekshirib ko'ramiz
      try {
        const igMeUrl = `https://graph.instagram.com/v21.0/me?fields=id,username,name,account_type&access_token=${encodeURIComponent(
          this.accessToken,
        )}`;
        const igRes = await fetch(igMeUrl, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(8_000),
        });
        const igData = (await igRes.json()) as {
          id?: string;
          username?: string;
          name?: string;
          account_type?: string;
        };

        if (igRes.ok && igData.id && igData.username) {
          const account: IgAccountInfo = {
            pageId: `ig_${igData.id}`,
            pageName: igData.name || igData.username,
            igUserId: igData.id,
            igUsername: igData.username,
          };
          return {
            ok: true,
            message: `Instagram Business ulandi: @${igData.username}`,
            accounts: [account],
          };
        }
      } catch {
        // Agar to'g'ridan-to'g'ri IG API bo'lmasa, Facebook Page tekshiruviga o'tamiz
      }

      // 2. Facebook Graph API orqali tekshirish (Facebook sahifasiga bog'langan Instagram)
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
   * Foydalanuvchini Meta OAuth dialogiga yo'naltiruvchi rasmiy URL yaratadi.
   */
  static buildOAuthUrl(params: {
    appId: string;
    configId?: string;
    redirectUri: string;
    state?: string;
    scopes?: string[];
  }): string {
    const search = new URLSearchParams({
      client_id: params.appId,
      redirect_uri: params.redirectUri,
      response_type: "code",
    });

    if (params.configId) {
      search.set("config_id", params.configId);
    } else {
      const scopes = params.scopes ?? [
        "instagram_basic",
        "instagram_content_publish",
        "pages_show_list",
        "pages_read_engagement",
      ];
      search.set("scope", scopes.join(","));
    }

    if (params.state) {
      search.set("state", params.state);
    }

    return `https://www.facebook.com/v21.0/dialog/oauth?${search.toString()}`;
  }

  /**
   * OAuth 'code' ni qisqa muddatli user access tokenga almashtiradi.
   */
  static async exchangeCodeForToken(
    code: string,
    appId: string,
    appSecret: string,
    redirectUri: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const url = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${encodeURIComponent(
      appId,
    )}&client_secret=${encodeURIComponent(
      appSecret,
    )}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&code=${encodeURIComponent(code)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: { message: string };
    };

    if (!res.ok || !data.access_token) {
      throw new IntegrationError(
        data.error?.message || `OAuth code almashishda xato (${res.status})`,
        "meta",
      );
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in ?? 3600,
    };
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

  /**
   * Meta Unified Login (Facebook Login for Business) OAuth dialogi havolasini yaratadi (2026 yangi Meta arxitekturasi).
   * Spetsifikatsiya:
   * https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth
   *
   * Parametrlar:
   * - client_id: META_APP_ID
   * - redirect_uri: Registered callback URL
   * - config_id: META_INSTAGRAM_CONFIG_ID (Meta Developer Dashboard'da yaratilgan configuration ID)
   * - response_type: "code"
   * - override_default_response_type: "true"
   * - state: CSRF token
   *
   * MUHIM: config_id ishlatilganda alohida scope parametri uzatilmaydi!
   */
  static buildUnifiedLoginOAuthUrl(params: MetaUnifiedLoginOAuthOptions): string {
    if (!params.appId) {
      throw new IntegrationError("META_APP_ID kiritilishi shart", "meta");
    }
    if (!params.configId) {
      throw new IntegrationError("META_INSTAGRAM_CONFIG_ID (config_id) kiritilishi shart", "meta");
    }
    if (!params.redirectUri) {
      throw new IntegrationError("redirect_uri kiritilishi shart", "meta");
    }

    const apiVersion = params.apiVersion || "v21.0";
    const search = new URLSearchParams({
      client_id: params.appId,
      redirect_uri: params.redirectUri,
      config_id: params.configId,
      response_type: "code",
      override_default_response_type: String(params.overrideDefaultResponseType ?? true),
    });

    if (params.state) {
      search.set("state", params.state);
    }

    return `https://www.facebook.com/${apiVersion}/dialog/oauth?${search.toString()}`;
  }

  /**
   * Instagram avtorizatsiya havolasini yaratadi.
   * Agar configId berilsa (yangi Meta Unified Login), buildUnifiedLoginOAuthUrl chaqiriladi.
   */
  static buildInstagramOAuthUrl(params: BuildInstagramOAuthUrlOptions): string {
    if (params.configId) {
      return InstagramGraphProvider.buildUnifiedLoginOAuthUrl({
        appId: params.appId,
        configId: params.configId,
        redirectUri: params.redirectUri,
        state: params.state,
      });
    }

    const search = new URLSearchParams({
      client_id: params.appId,
      redirect_uri: params.redirectUri,
      response_type: "code",
    });

    const defaultScopes = [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_comments",
      "instagram_business_manage_messages",
    ];
    const scopes =
      params.scopes && params.scopes.length > 0 ? params.scopes : defaultScopes;
    search.set("scope", scopes.join(","));

    if (params.state) {
      search.set("state", params.state);
    }

    if (params.enableFbLogin === false || params.enableFbLogin === undefined) {
      search.set("enable_fb_login", "0");
    }

    if (params.forceAuthentication !== false) {
      search.set("force_authentication", "1");
    }

    return `https://www.instagram.com/oauth/authorize?${search.toString()}`;
  }

  /**
   * Meta Unified Login OAuth code'ni server orqali Business Integration System User Access Tokenga (SUAT) almashtiradi.
   * GET https://graph.facebook.com/{apiVersion}/oauth/access_token
   */
  static async exchangeUnifiedLoginCodeForToken(params: {
    code: string;
    appId: string;
    appSecret: string;
    redirectUri: string;
    apiVersion?: string;
  }): Promise<{ accessToken: string; tokenType?: string; expiresIn?: number }> {
    const apiVersion = params.apiVersion || "v21.0";
    const cleanCode = (params.code || "").replace(/#_$/, "").trim();

    const url = `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${encodeURIComponent(
      params.appId,
    )}&client_secret=${encodeURIComponent(
      params.appSecret,
    )}&redirect_uri=${encodeURIComponent(
      params.redirectUri,
    )}&code=${encodeURIComponent(cleanCode)}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await res.json()) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
      error?: { message: string; type?: string; code?: number };
    };

    if (!res.ok || !data.access_token) {
      throw new IntegrationError(
        data.error?.message || `Meta OAuth token almashishda xato (${res.status})`,
        "meta",
        data.error?.code,
      );
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Meta Unified Login tokenni uzoq muddatli tokenga almashtiradi / tekshiradi.
   */
  static async exchangeUnifiedLoginLongLivedToken(params: {
    accessToken: string;
    appId: string;
    appSecret: string;
    apiVersion?: string;
  }): Promise<{ accessToken: string; expiresIn: number }> {
    const apiVersion = params.apiVersion || "v21.0";
    const url = `https://graph.facebook.com/${apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
      params.appId,
    )}&client_secret=${encodeURIComponent(
      params.appSecret,
    )}&fb_exchange_token=${encodeURIComponent(params.accessToken)}`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      const data = (await res.json()) as {
        access_token?: string;
        expires_in?: number;
        error?: { message: string };
      };

      if (res.ok && data.access_token) {
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in ?? 5184000,
        };
      }
    } catch {
      // Agar token allaqachon System User Token bo'lsa
    }

    return {
      accessToken: params.accessToken,
      expiresIn: 5184000,
    };
  }

  /**
   * Meta Unified Login (Facebook Login for Business) orqali ruxsat berilgan Instagram akkauntlarini aniqlaydi.
   * Multi-layer discovery:
   * 1. /me/assigned_instagram_accounts (Business Portfolio'da to'g'ridan-to'g'ri biriktirilgan Instagram akkauntlar)
   * 2. /me/accounts?fields=instagram_business_account (Facebook Page orqali bog'langan Instagram akkauntlar)
   * 3. /debug_token granular_scopes (portfolio asset mapping orqali)
   */
  static async discoverUnifiedLoginInstagramAccounts(params: {
    accessToken: string;
    appId?: string;
    appSecret?: string;
    apiVersion?: string;
  }): Promise<DiscoveredInstagramAccount[]> {
    const apiVersion = params.apiVersion || "v21.0";
    const accounts: DiscoveredInstagramAccount[] = [];
    const seenIds = new Set<string>();

    // 1-Yo'l: Unified Login rasmiy endpoints — /me/assigned_instagram_accounts
    try {
      const url = `https://graph.facebook.com/${apiVersion}/me/assigned_instagram_accounts?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(
        params.accessToken,
      )}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const data = (await res.json()) as {
        data?: Array<{ id: string; username: string; name?: string; profile_picture_url?: string }>;
      };

      if (res.ok && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (item.id && item.username && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            accounts.push({
              id: item.id,
              username: item.username,
              name: item.name || item.username,
              profilePictureUrl: item.profile_picture_url,
              discoverySource: "assigned_accounts",
            });
          }
        }
      }
    } catch {
      // Keyingi usulga o'tamiz
    }

    // 2-Yo'l: Facebook Page'ga bog'langan Instagram — /me/accounts
    try {
      const url = `https://graph.facebook.com/${apiVersion}/me/accounts?fields=id,name,instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
        params.accessToken,
      )}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const data = (await res.json()) as {
        data?: Array<{
          id: string;
          name: string;
          instagram_business_account?: {
            id: string;
            username: string;
            name?: string;
            profilePictureUrl?: string;
            profile_picture_url?: string;
          };
        }>;
      };

      if (res.ok && Array.isArray(data.data)) {
        for (const page of data.data) {
          const ig = page.instagram_business_account;
          if (ig?.id && !seenIds.has(ig.id)) {
            let igUsername = ig.username;
            let igName = ig.name;
            let igPic = ig.profile_picture_url || ig.profilePictureUrl;

            if (!igUsername) {
              try {
                const nodeUrl = `https://graph.facebook.com/${apiVersion}/${ig.id}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(
                  params.accessToken,
                )}`;
                const nodeRes = await fetch(nodeUrl, { signal: AbortSignal.timeout(6_000) });
                const nodeData = (await nodeRes.json()) as {
                  id?: string;
                  username?: string;
                  name?: string;
                  profile_picture_url?: string;
                };
                if (nodeData.username) {
                  igUsername = nodeData.username;
                  igName = nodeData.name || nodeData.username;
                  igPic = nodeData.profile_picture_url;
                }
              } catch {}
            }

            if (igUsername) {
              seenIds.add(ig.id);
              accounts.push({
                id: ig.id,
                username: igUsername,
                name: igName || igUsername,
                profilePictureUrl: igPic,
                pageId: page.id,
                discoverySource: "page_linked",
              });
            }
          }
        }
      }
    } catch {
      // Keyingi usulga o'tamiz
    }

    // 3-Yo'l: Debug token orqali granular_scopes'dan target_id aniqlash
    if (accounts.length === 0 && params.appId && params.appSecret) {
      try {
        const debugUrl = `https://graph.facebook.com/${apiVersion}/debug_token?input_token=${encodeURIComponent(
          params.accessToken,
        )}&access_token=${encodeURIComponent(`${params.appId}|${params.appSecret}`)}`;
        const debugRes = await fetch(debugUrl, { signal: AbortSignal.timeout(10_000) });
        const debugData = (await debugRes.json()) as {
          data?: {
            granular_scopes?: Array<{ scope: string; target_ids?: string[] }>;
          };
        };

        const targetIds = new Set<string>();
        for (const gs of debugData.data?.granular_scopes ?? []) {
          for (const tid of gs.target_ids ?? []) {
            targetIds.add(tid);
          }
        }

        for (const tid of targetIds) {
          if (!seenIds.has(tid)) {
            try {
              const igUrl = `https://graph.facebook.com/${apiVersion}/${tid}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(
                params.accessToken,
              )}`;
              const igRes = await fetch(igUrl, { signal: AbortSignal.timeout(8_000) });
              const igData = (await igRes.json()) as {
                id?: string;
                username?: string;
                name?: string;
                profile_picture_url?: string;
              };
              if (igRes.ok && igData.id && igData.username) {
                seenIds.add(igData.id);
                accounts.push({
                  id: igData.id,
                  username: igData.username,
                  name: igData.name || igData.username,
                  profilePictureUrl: igData.profile_picture_url,
                  discoverySource: "direct_node",
                });
              }
            } catch {}
          }
        }
      } catch {}
    }

    // 4-Yo'l: To'g'ridan-to'g'ri /me orqali tekshirish
    if (accounts.length === 0) {
      try {
        const meUrl = `https://graph.facebook.com/${apiVersion}/me?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(
          params.accessToken,
        )}`;
        const meRes = await fetch(meUrl, { signal: AbortSignal.timeout(8_000) });
        const meData = (await meRes.json()) as {
          id?: string;
          username?: string;
          name?: string;
          profile_picture_url?: string;
        };
        if (meRes.ok && meData.id && meData.username) {
          seenIds.add(meData.id);
          accounts.push({
            id: meData.id,
            username: meData.username,
            name: meData.name || meData.username,
            profilePictureUrl: meData.profile_picture_url,
            discoverySource: "direct_node",
          });
        }
      } catch {}
    }

    // 5-Yo'l: graph.instagram.com orqali tekshirish
    if (accounts.length === 0) {
      try {
        const igMeUrl = `https://graph.instagram.com/${apiVersion}/me?fields=id,user_id,username,name,profile_picture_url&access_token=${encodeURIComponent(
          params.accessToken,
        )}`;
        const igRes = await fetch(igMeUrl, { signal: AbortSignal.timeout(8_000) });
        const igData = (await igRes.json()) as {
          id?: string;
          user_id?: string;
          username?: string;
          name?: string;
          profile_picture_url?: string;
        };
        const finalId = igData.id || igData.user_id;
        if (igRes.ok && finalId && igData.username && !seenIds.has(finalId)) {
          seenIds.add(finalId);
          accounts.push({
            id: finalId,
            username: igData.username,
            name: igData.name || igData.username,
            profilePictureUrl: igData.profile_picture_url,
            discoverySource: "direct_node",
          });
        }
      } catch {}
    }

    return accounts;
  }

  /**
   * Instagram Login for Business OAuth 'code' ni qisqa muddatli access tokenga almashtiradi.
   * POST https://api.instagram.com/oauth/access_token
   */
  static async exchangeInstagramCodeForToken(params: {
    code: string;
    appId: string;
    appSecret: string;
    redirectUri: string;
  }): Promise<{ accessToken: string; userId: string }> {
    // Instagram redirect paytida code oxiriga '#_' qo'shib yuboradi; uni tozalaymiz
    const cleanCode = (params.code || "").replace(/#_$/, "").trim();

    const form = new URLSearchParams({
      client_id: params.appId,
      client_secret: params.appSecret,
      grant_type: "authorization_code",
      redirect_uri: params.redirectUri,
      code: cleanCode,
    });

    const res = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await res.json()) as {
      access_token?: string;
      user_id?: number | string;
      error_message?: string;
      error_type?: string;
      code?: number;
    };

    if (!res.ok || !data.access_token) {
      throw new IntegrationError(
        data.error_message || `Instagram OAuth code almashishda xato (${res.status})`,
        "meta",
      );
    }

    return {
      accessToken: data.access_token,
      userId: String(data.user_id || ""),
    };
  }

  /**
   * Instagram qisqa muddatli tokenni 60 kunlik Long-Lived tokenga almashtiradi.
   * GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token
   */
  static async exchangeInstagramLongLivedToken(params: {
    shortLivedToken: string;
    appSecret: string;
  }): Promise<{ accessToken: string; expiresIn: number }> {
    const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(
      params.appSecret,
    )}&access_token=${encodeURIComponent(params.shortLivedToken)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      token_type?: string;
      error?: { message: string; code?: number };
    };

    if (!res.ok || !data.access_token) {
      throw new IntegrationError(
        data.error?.message || `Instagram Long-lived token olishda xato (${res.status})`,
        "meta",
      );
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in ?? 5184000, // 60 kun (sekundlarda)
    };
  }

  /**
   * Instagram 60 kunlik Long-Lived tokenni yangilaydi (kamida 24 soat o'tganidan so'ng).
   * GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token
   */
  static async refreshInstagramLongLivedToken(params: {
    accessToken: string;
  }): Promise<{ accessToken: string; expiresIn: number }> {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(
      params.accessToken,
    )}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      token_type?: string;
      error?: { message: string; code?: number };
    };

    if (!res.ok || !data.access_token) {
      throw new IntegrationError(
        data.error?.message || `Instagram Long-lived tokenni yangilashda xato (${res.status})`,
        "meta",
      );
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in ?? 5184000,
    };
  }

  /**
   * Instagram Professional foydalanuvchi ma'lumotlarini to'g'ridan-to'g'ri Graph API orqali oladi.
   * GET https://graph.instagram.com/v21.0/me?fields=id,user_id,username,name,account_type,profile_picture_url
   */
  static async getInstagramProfile(accessToken: string): Promise<InstagramUserProfile> {
    const url = `https://graph.instagram.com/v21.0/me?fields=id,user_id,username,name,account_type,profile_picture_url&access_token=${encodeURIComponent(
      accessToken,
    )}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const data = (await res.json()) as {
      id?: string;
      user_id?: string;
      username?: string;
      name?: string;
      account_type?: string;
      profile_picture_url?: string;
      error?: { message: string; code?: number };
    };

    const finalId = data.id || data.user_id;

    if (!res.ok || !finalId || !data.username) {
      throw new IntegrationError(
        data.error?.message || `Instagram profil ma'lumotlarini olishda xato (${res.status})`,
        "meta",
      );
    }

    const rawType = (data.account_type || "").toUpperCase();

    return {
      id: finalId,
      username: data.username,
      name: data.name,
      accountType: rawType,
      profilePictureUrl: data.profile_picture_url,
    };
  }
}

