import { describe, expect, it } from "vitest";
import { PexelsProvider } from "./pexels";

describe("PexelsProvider", () => {
  it("kalit kiritilmaganda checkConnection xatolik qaytaradi", async () => {
    const pexels = new PexelsProvider();
    const res = await pexels.checkConnection();
    expect(res.ok).toBe(false);
    expect(res.message).toContain("kiritilmagan");
  });

  it("kalit kiritilmaganda searchVerticalVideos bo'sh massiv qaytaradi", async () => {
    const pexels = new PexelsProvider();
    const videos = await pexels.searchVerticalVideos("nature");
    expect(videos).toEqual([]);
  });

  it("kalit bilan provider instansiyasi yaratiladi", () => {
    const pexels = new PexelsProvider("sample_key_123");
    expect(pexels).toBeInstanceOf(PexelsProvider);
  });
});

