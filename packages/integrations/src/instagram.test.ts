import { describe, expect, it } from "vitest";
import { InstagramGraphProvider } from "./instagram";

describe("InstagramGraphProvider", () => {
  it("bo'sh token berilganda xatolik beradi", () => {
    expect(() => new InstagramGraphProvider("")).toThrow("Instagram Access Token kiritilmagan");
    expect(() => new InstagramGraphProvider("   ")).toThrow("Instagram Access Token kiritilmagan");
  });

  it("to'g'ri token bilan obyekt yaratiladi", () => {
    const provider = new InstagramGraphProvider("test_token_123");
    expect(provider).toBeInstanceOf(InstagramGraphProvider);
  });

  it("buildOAuthUrl to'g'ri parametrlar bilan URL yaratadi", () => {
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
});

