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
});

