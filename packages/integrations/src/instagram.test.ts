import { describe, expect, it, vi, beforeEach } from "vitest";
import { InstagramGraphProvider } from "./instagram";

describe("InstagramGraphProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("bo'sh token berilganda xatolik beradi", () => {
    expect(() => new InstagramGraphProvider("")).toThrow("Instagram Access Token kiritilmagan");
    expect(() => new InstagramGraphProvider("   ")).toThrow("Instagram Access Token kiritilmagan");
  });

  it("to'g'ri token bilan obyekt yaratiladi", () => {
    const provider = new InstagramGraphProvider("test_token_123");
    expect(provider).toBeInstanceOf(InstagramGraphProvider);
  });

  it("buildOAuthUrl Facebook dialogi havolasini yaratadi", () => {
    const url = InstagramGraphProvider.buildOAuthUrl({
      appId: "123456789",
      redirectUri: "https://example.com/api/auth/meta/callback",
      state: "xyz-state-123",
    });

    expect(url).toContain("https://www.facebook.com/v21.0/dialog/oauth?");
    expect(url).toContain("client_id=123456789");
    expect(url).toContain("redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Fauth%2Fmeta%2Fcallback");
    expect(url).toContain("state=xyz-state-123");
    expect(url).toContain("instagram_content_publish");
  });

  it("buildInstagramOAuthUrl rasmiy native Instagram avtorizatsiya URL yaratadi (facebook.com emas)", () => {
    const url = InstagramGraphProvider.buildInstagramOAuthUrl({
      appId: "987654321",
      redirectUri: "https://example.com/api/auth/instagram/callback",
      state: "state-direct-ig",
    });

    // Aniq instagram.com/oauth/authorize bo'lishi kerak, facebook.com emas
    expect(url.startsWith("https://www.instagram.com/oauth/authorize?")).toBe(true);
    expect(url).not.toContain("facebook.com");
    expect(url).toContain("client_id=987654321");
    expect(url).toContain("redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Fauth%2Finstagram%2Fcallback");
    expect(url).toContain("response_type=code");
    expect(url).toContain("state=state-direct-ig");
    expect(url).toContain("instagram_business_basic");
    expect(url).toContain("instagram_business_content_publish");
    expect(url).toContain("enable_fb_login=0");
    expect(url).toContain("force_authentication=1");
  });

  it("exchangeInstagramCodeForToken koddan #_ belgisini tozalaydi va token qaytaradi", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "IGQ_short_lived_token_123",
        user_id: 17841400000001,
      }),
    });
    global.fetch = mockFetch;

    const res = await InstagramGraphProvider.exchangeInstagramCodeForToken({
      code: "AQD123code_payload#_",
      appId: "ig_app_999",
      appSecret: "ig_secret_888",
      redirectUri: "https://example.com/callback",
    });

    expect(res.accessToken).toBe("IGQ_short_lived_token_123");
    expect(res.userId).toBe("17841400000001");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.instagram.com/oauth/access_token",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("code=AQD123code_payload"), // #_ tozalangan
      }),
    );
  });

  it("exchangeInstagramLongLivedToken 60 kunlik token qaytaradi", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "IGQ_long_lived_token_456",
        token_type: "bearer",
        expires_in: 5184000,
      }),
    });

    const res = await InstagramGraphProvider.exchangeInstagramLongLivedToken({
      shortLivedToken: "IGQ_short_123",
      appSecret: "secret_xyz",
    });

    expect(res.accessToken).toBe("IGQ_long_lived_token_456");
    expect(res.expiresIn).toBe(5184000);
  });

  it("buildUnifiedLoginOAuthUrl to'g'ri Meta Unified Login havolasini yaratadi (scope uzatilmaydi)", () => {
    const url = InstagramGraphProvider.buildUnifiedLoginOAuthUrl({
      appId: "1174196955097298",
      configId: "28915809191434271",
      redirectUri: "https://example.com/api/auth/instagram/callback",
      state: "csrf-state-999",
      apiVersion: "v21.0",
      overrideDefaultResponseType: true,
    });

    expect(url.startsWith("https://www.facebook.com/v21.0/dialog/oauth?")).toBe(true);
    expect(url).toContain("client_id=1174196955097298");
    expect(url).toContain("config_id=28915809191434271");
    expect(url).toContain("response_type=code");
    expect(url).toContain("override_default_response_type=true");
    expect(url).toContain("state=csrf-state-999");
    // Unified Login'da config_id bo'lgani uchun scope parametri umuman uzatilmasligi shart
    expect(url).not.toContain("scope=");
  });

  it("exchangeUnifiedLoginCodeForToken Meta serveridan token oladi", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "EAAP_system_user_token_123",
        token_type: "bearer",
        expires_in: 5184000,
      }),
    });

    const res = await InstagramGraphProvider.exchangeUnifiedLoginCodeForToken({
      code: "AQ_auth_code_123#_",
      appId: "1174196955097298",
      appSecret: "secret_123",
      redirectUri: "https://example.com/api/auth/instagram/callback",
      apiVersion: "v21.0",
    });

    expect(res.accessToken).toBe("EAAP_system_user_token_123");
    expect(res.tokenType).toBe("bearer");
    expect(res.expiresIn).toBe(5184000);
  });

  it("discoverUnifiedLoginInstagramAccounts assigned_instagram_accounts orqali hisoblarni aniqlaydi", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1784140009999",
            username: "unified_brand_uz",
            name: "Unified Brand",
            profile_picture_url: "https://cdn.fb.com/pic.jpg",
          },
        ],
      }),
    });

    const accounts = await InstagramGraphProvider.discoverUnifiedLoginInstagramAccounts({
      accessToken: "EAAP_token",
      apiVersion: "v21.0",
    });

    expect(accounts).toHaveLength(1);
    expect(accounts[0].id).toBe("1784140009999");
    expect(accounts[0].username).toBe("unified_brand_uz");
    expect(accounts[0].discoverySource).toBe("assigned_accounts");
  });

  it("discoverUnifiedLoginInstagramAccounts Facebook Page orqali bog'langan hisobni aniqlaydi", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      callCount++;
      if (url.includes("/me/assigned_instagram_accounts")) {
        return {
          ok: true,
          json: async () => ({ data: [] }), // bo'sh
        };
      }
      if (url.includes("/me/accounts")) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "page_123",
                name: "Biznes Sahifa",
                instagram_business_account: {
                  id: "1784140008888",
                  username: "page_connected_ig",
                  name: "Page IG",
                  profile_picture_url: "https://cdn.fb.com/page_ig.jpg",
                },
              },
            ],
          }),
        };
      }
      return { ok: false, json: async () => ({}) };
    });

    const accounts = await InstagramGraphProvider.discoverUnifiedLoginInstagramAccounts({
      accessToken: "EAAP_page_token",
      apiVersion: "v21.0",
    });

    expect(accounts).toHaveLength(1);
    expect(accounts[0].id).toBe("1784140008888");
    expect(accounts[0].username).toBe("page_connected_ig");
    expect(accounts[0].pageId).toBe("page_123");
    expect(accounts[0].discoverySource).toBe("page_linked");
  });

  it("exchangeUnifiedLoginLongLivedToken xato berganda original tokenni qaytaradi", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "Already long lived" } }),
    });

    const res = await InstagramGraphProvider.exchangeUnifiedLoginLongLivedToken({
      accessToken: "original_suat_token",
      appId: "app_123",
      appSecret: "sec_123",
    });

    expect(res.accessToken).toBe("original_suat_token");
    expect(res.expiresIn).toBe(5184000);
  });

  it("getInstagramProfile profil ma'lumotlarini to'g'ri qaytaradi", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "178414012345678",
        username: "creative_artist_uz",
        name: "Creative Artist",
        account_type: "BUSINESS",
        profile_picture_url: "https://cdn.instagram.com/pic.jpg",
      }),
    });

    const profile = await InstagramGraphProvider.getInstagramProfile("valid_token");
    expect(profile.id).toBe("178414012345678");
    expect(profile.username).toBe("creative_artist_uz");
    expect(profile.accountType).toBe("BUSINESS");
    expect(profile.profilePictureUrl).toBe("https://cdn.instagram.com/pic.jpg");
  });
});


