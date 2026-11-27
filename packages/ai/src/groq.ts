import {
  AiProvider,
  AiProviderError,
  EmbeddingResult,
  SpeechResult,
  TextOptions,
  TextResult,
} from "./types";

const GROQ_BASE = "https://api.groq.com/openai/v1";

export interface GroqOptions {
  apiKey: string;
  textModel?: string;
  textFallbackModel?: string;
}

export class GroqProvider implements AiProvider {
  readonly name = "groq";
  private readonly textModel: string;
  private readonly textFallback: string;

  constructor(
    private readonly apiKey: string,
    opts: Omit<GroqOptions, "apiKey"> = {},
  ) {
    if (!apiKey) throw new AiProviderError("Groq API kaliti bo'sh");
    this.textModel = opts.textModel ?? "llama-3.3-70b-versatile";
    this.textFallback = opts.textFallbackModel ?? "llama-3.1-8b-instant";
  }

  private async postWithRetry<T>(
    endpoint: string,
    body: unknown,
    maxRetries = 2,
  ): Promise<T> {
    let attempt = 0;
    while (attempt <= maxRetries) {
      const res = await fetch(`${GROQ_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        return (await res.json()) as T;
      }

      const data = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      const retryable = res.status === 429 || res.status === 503;

      if (retryable && attempt < maxRetries) {
        attempt++;
        const delay = attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw new AiProviderError(
        data.error?.message ?? `Groq xatosi (${res.status})`,
        res.status,
        retryable,
      );
    }
    throw new AiProviderError("Groq so'rovi amalga oshmadi", 500, false);
  }

  async generateText(prompt: string, opts: TextOptions = {}): Promise<TextResult> {
    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (opts.skill) {
      messages.push({ role: "system", content: opts.skill });
    }
    messages.push({ role: "user", content: prompt });

    const models = [this.textModel, this.textFallback];
    let lastErr: unknown;

    for (const model of models) {
      try {
        const body: Record<string, unknown> = {
          model,
          messages,
          temperature: opts.temperature ?? 0.7,
        };

        if (opts.maxOutputTokens) {
          body.max_tokens = opts.maxOutputTokens;
        }

        if (opts.jsonMode) {
          body.response_format = { type: "json_object" };
        }

        const data = await this.postWithRetry<any>("/chat/completions", body);
        const text = data.choices?.[0]?.message?.content ?? "";
        const u = data.usage ?? {};

        return {
          text,
          model,
          usage: {
            promptTokens: u.prompt_tokens ?? 0,
            outputTokens: u.completion_tokens ?? 0,
            totalTokens: u.total_tokens ?? 0,
          },
        };
      } catch (err) {
        lastErr = err;
        if (
          err instanceof AiProviderError &&
          (err.status === 503 || err.status === 429)
        ) {
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  async generateSpeech(
    _text: string,
    _opts: { voice?: string } = {},
  ): Promise<SpeechResult> {
    throw new AiProviderError(
      "Groq faqat matn generatsiyasini qo'llab-quvvatlaydi. Ovoz (TTS) uchun Gemini ishlatiladi.",
    );
  }

  async embed(_texts: string[]): Promise<EmbeddingResult> {
    throw new AiProviderError(
      "Groq embedding provayderi sifatida sozlanmagan. Matn generatsiyasi uchun Groq, ovoz/embedding uchun Gemini ishlatiladi.",
    );
  }

  async checkConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await this.generateText("Salom deb javob bering.", {
        maxOutputTokens: 32,
      });
      return { ok: true, message: `Ulandi (Groq: ${res.model})` };
    } catch (err) {
      const msg = err instanceof AiProviderError ? err.message : String(err);
      return { ok: false, message: msg.slice(0, 200) };
    }
  }
}

