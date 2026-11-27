import {
  AiProvider,
  AiProviderError,
  EmbeddingResult,
  SpeechResult,
  TextOptions,
  TextResult,
} from "./types";

const GROQ_BASE = "https://api.groq.com/openai/v1";

/**
 * Afzal ko'rilgan modellar reytingi (yuqori sifatdan tezkorlikka qarab).
 * API kalitda qaysi model mavjud bo'lsa, avtomatik birinchisi tanlanadi.
 */
const PREFERRED_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "qwen/qwen3.8-27b",
];

export interface GroqOptions {
  apiKey: string;
  textModel?: string;
  textFallbackModel?: string;
}

export class GroqProvider implements AiProvider {
  readonly name = "groq";
  private textModel: string;
  private readonly textFallback: string;
  private detectedModels: string[] | null = null;

  constructor(
    private readonly apiKey: string,
    opts: Omit<GroqOptions, "apiKey"> = {},
  ) {
    if (!apiKey) throw new AiProviderError("Groq API kaliti bo'sh");
    this.textModel = opts.textModel ?? "llama-3.3-70b-versatile";
    this.textFallback = opts.textFallbackModel ?? "llama-3.1-8b-instant";
  }

  /**
   * Ushbu API kalit uchun mavjud barcha modellarni Groq API'dan avtomatik oladi.
   */
  async getAvailableModels(): Promise<string[]> {
    if (this.detectedModels && this.detectedModels.length > 0) {
      return this.detectedModels;
    }

    try {
      const res = await fetch(`${GROQ_BASE}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new AiProviderError(
          data?.error?.message ?? `Groq modellari ro'yxatini olib bo'lmadi (${res.status})`,
          res.status,
        );
      }

      const data = (await res.json()) as { data?: Array<{ id: string; active?: boolean }> };
      const allIds = (data.data || [])
        .filter((m) => m.active !== false)
        .map((m) => m.id);

      // Faqat matn/chat modellarini filtrlash (whisper, tts, guard, vision lardan tashqari)
      const textModels = allIds.filter(
        (id) =>
          !id.includes("whisper") &&
          !id.includes("safeguard") &&
          !id.includes("guard") &&
          !id.includes("vision") &&
          !id.includes("tts") &&
          !id.includes("playai") &&
          !id.includes("orpheus"),
      );

      this.detectedModels = textModels.length > 0 ? textModels : allIds;
      return this.detectedModels;
    } catch (err) {
      if (err instanceof AiProviderError) throw err;
      return [this.textModel, this.textFallback];
    }
  }

  /**
   * Ushbu API kalit uchun eng yaxshi mavjud modelni aniqlaydi.
   */
  async resolveBestModel(): Promise<string> {
    try {
      const available = await this.getAvailableModels();

      // 1. Agar joriy ko'rsatilgan model kalitda mavjud bo'lsa
      if (available.includes(this.textModel)) {
        return this.textModel;
      }

      // 2. Afzal ko'rilgan modellar reytingidan birinchisini qidirish
      for (const pref of PREFERRED_MODELS) {
        if (available.includes(pref)) {
          this.textModel = pref;
          return pref;
        }
      }

      // 3. Agar ro'yxatda "llama" bilan boshlanuvchi bo'lsa
      const llama = available.find((id) => id.includes("llama"));
      if (llama) {
        this.textModel = llama;
        return llama;
      }

      // 4. Ro'yxatdagi birinchi model
      if (available.length > 0) {
        this.textModel = available[0];
        return available[0];
      }
    } catch {
      // Tarmoq xatosi bo'lsa standart zaxiraga o'tadi
    }

    return this.textFallback;
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

    // Modellar ro'yxati: oldin avtomatik aniqlangan eng yaxshi model, keyin kalitdagi mavjud modellar
    let candidateModels: string[];
    try {
      const available = await this.getAvailableModels();
      const best = await this.resolveBestModel();
      candidateModels = Array.from(
        new Set([best, ...available, this.textModel, this.textFallback]),
      );
    } catch {
      candidateModels = Array.from(new Set([this.textModel, this.textFallback]));
    }

    let lastErr: unknown;

    for (const model of candidateModels) {
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

        // Muvaffaqiyatli ishlagan modelni asosiy model qilib saqlaymiz
        this.textModel = model;

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
        // Agar model mavjud bo'lmasa (404/400) yoki servis band bo'lsa (503/429), darhol keyingi modelga o'tadi!
        if (
          err instanceof AiProviderError &&
          (err.status === 503 ||
            err.status === 429 ||
            err.status === 404 ||
            err.status === 400 ||
            err.message.includes("does not exist") ||
            err.message.includes("do not have access"))
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
      // Kalitdagi ruxsat etilgan eng yaxshi model avtomatik aniqlanadi va sinovdan o'tadi
      const res = await this.generateText("Salom deb javob bering.", {
        maxOutputTokens: 32,
      });

      return {
        ok: true,
        message: `Ulandi (Groq modeli: ${res.model})`,
      };
    } catch (err) {
      const msg = err instanceof AiProviderError ? err.message : String(err);
      return { ok: false, message: msg.slice(0, 200) };
    }
  }
}
