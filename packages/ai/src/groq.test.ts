import { afterEach, describe, expect, it, vi } from "vitest";
import { GroqProvider } from "./groq";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("GroqProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("API kalitdagi mavjud modellarni aniqlaydi va non-chat modellarni filtrlaydi", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        data: [
          { id: "whisper-large-v3", active: true },
          { id: "playai-tts", active: true },
          { id: "meta-llama/llama-guard-4-12b", active: true },
          { id: "llama-3.1-8b-instant", active: true },
          { id: "llama-3.3-70b-versatile", active: false },
        ],
      }),
    );

    const groq = new GroqProvider("gsk_test_123");
    const models = await groq.getAvailableModels();
    expect(models).toEqual(["llama-3.1-8b-instant"]);

    const best = await groq.resolveBestModel();
    expect(best).toBe("llama-3.1-8b-instant");
  });

  it("checkConnection kalitda mavjud modelni avtomatik topib ulanish xabarini qaytaradi", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            { id: "qwen/qwen3-32b", active: true },
            { id: "llama-3.1-8b-instant", active: true },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [{ message: { content: "Salom!" } }],
          usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
        }),
      );

    const groq = new GroqProvider("gsk_test_123");
    const result = await groq.checkConnection();

    expect(result.ok).toBe(true);
    expect(result.message).toContain("llama-3.1-8b-instant");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const chatCallBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(chatCallBody.model).toBe("llama-3.1-8b-instant");
  });

  it("birinchi model ruxsat etilmaganda keyingi mavjud modelga avtomatik o'tadi", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            { id: "llama-3.3-70b-versatile", active: true },
            { id: "gemma2-9b-it", active: true },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          { error: { message: "The model `llama-3.3-70b-versatile` does not exist or you do not have access to it." } },
          404,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [{ message: { content: "Tayyor" } }],
          usage: { prompt_tokens: 4, completion_tokens: 1, total_tokens: 5 },
        }),
      );

    const groq = new GroqProvider("gsk_test_123");
    const res = await groq.generateText("Test");

    expect(res.model).toBe("gemma2-9b-it");
    expect(res.text).toBe("Tayyor");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
