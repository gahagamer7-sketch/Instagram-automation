import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiProvider } from "./gemini";
import { pcmToWav } from "./wav";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("GeminiProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("standart modellarni gemini-3.8-flash va gemini-3.8-flash-tts sifatida ishlatadi hamda ulanishni tekshiradi", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          models: [
            {
              name: "models/gemini-3.8-flash-tts",
              supportedGenerationMethods: ["generateContent"],
            },
            {
              name: "models/gemini-3.8-flash",
              supportedGenerationMethods: ["generateContent"],
            },
            {
              name: "models/gemini-embedding-001",
              supportedGenerationMethods: ["embedContent"],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          candidates: [{ content: { parts: [{ text: "Salom!" }] } }],
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 2, totalTokens: 7 },
        }),
      );

    const gemini = new GeminiProvider("AIzaTestKey1234");
    const result = await gemini.checkConnection();

    expect(result.ok).toBe(true);
    expect(result.message).toBe("Ulandi (gemini-3.8-flash)");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "/models/gemini-3.8-flash:generateContent",
    );
  });

  it("eskirgan yoki mavjud bo'lmagan model xato qaytarsa keyingi faol modelga o'tadi", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ models: [] }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              message:
                "This model models/gemini-2.0-flash is no longer available. Please update your code to use models/gemini-3.8-flash.",
            },
          },
          404,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          candidates: [{ content: { parts: [{ text: "Ishladi" }] } }],
          usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 1, totalTokens: 5 },
        }),
      );

    const gemini = new GeminiProvider("AIzaTestKey1234", {
      textModel: "gemini-2.0-flash",
    });
    const res = await gemini.generateText("Salom");

    expect(res.model).toBe("gemini-3.8-flash");
    expect(res.text).toBe("Ishladi");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("noto'g'ri API kalitda darhol xabar qaytaradi", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            message: "API key not valid. Please pass a valid API key.",
          },
        },
        400,
      ),
    );

    const gemini = new GeminiProvider("AIzaInvalid");
    const res = await gemini.checkConnection();

    expect(res.ok).toBe(false);
    expect(res.message).toContain("API key not valid");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gemini-3.8-flash-tts dan kelgan tayyor RIFF WAV audioni qayta o'ramasdan saqlaydi", async () => {
    const rawPcm = Buffer.alloc(48000); // 1 soniya @ 24kHz 16-bit mono
    const wavBytes = pcmToWav(rawPcm, 24000);

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          models: [
            {
              name: "models/gemini-3.8-flash-tts",
              supportedGenerationMethods: ["generateContent"],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          candidates: [
            {
              content: {
                parts: [
                  {
                    inlineData: {
                      mimeType: "audio/wav",
                      data: wavBytes.toString("base64"),
                    },
                  },
                ],
              },
            },
          ],
        }),
      );

    const gemini = new GeminiProvider("AIzaTestKey1234");
    const speech = await gemini.generateSpeech("Salom, do'stlar!", { voice: "Kore" });

    expect(speech.model).toBe("gemini-3.8-flash-tts");
    expect(speech.wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    // Qayta o'ralmasligi kerak (bayt hajmi o'zgarishsiz qoladi)
    expect(speech.wav.length).toBe(wavBytes.length);
    expect(speech.durationSec).toBeCloseTo(1, 2);

    const body = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(body.contents[0].parts[0].text).toBe("Salom, do'stlar!");
    expect(body.contents[0].parts[0].speechMetadata).toBeDefined();
  });

  it("xom PCM audio qaytargan TTS javobini WAV ga o'raydi", async () => {
    const rawPcm = Buffer.alloc(24000); // 0.5 soniya @ 24kHz 16-bit mono

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ models: [] }))
      .mockResolvedValueOnce(
        jsonResponse({
          candidates: [
            {
              content: {
                parts: [
                  {
                    inlineData: {
                      mimeType: "audio/L16;rate=24000",
                      data: rawPcm.toString("base64"),
                    },
                  },
                ],
              },
            },
          ],
        }),
      );

    const gemini = new GeminiProvider("AIzaTestKey1234", {
      ttsModel: "gemini-2.5-flash-preview-tts",
    });
    const speech = await gemini.generateSpeech("Sinov");

    expect(speech.wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(speech.wav.length).toBe(rawPcm.length + 44);
    expect(speech.durationSec).toBeCloseTo(0.5, 2);
  });
});
