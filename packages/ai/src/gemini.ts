import {
  AiProvider,
  AiProviderError,
  EmbeddingResult,
  SpeechResult,
  TextOptions,
  TextResult,
} from "./types";
import { pcmToWav, parseSampleRate } from "./wav";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

/**
 * Matn generatsiyasi uchun afzal ko'rilgan faol Gemini modellari tartibi.
 * API kalitda qaysi biri mavjud bo'lsa, eng yuqorisi avtomatik tanlanadi.
 */
const PREFERRED_TEXT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.8-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.0-flash",
  "gemini-2.5-flash",
];

/**
 * Ovoz (TTS) generatsiyasi uchun afzal ko'rilgan faol Gemini TTS modellari tartibi.
 */
const PREFERRED_TTS_MODELS = [
  "gemini-3.8-flash-tts",
  "gemini-3.5-flash-tts",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
];

const EXCLUDED_TEXT_MODEL_KEYWORDS = [
  "tts",
  "embedding",
  "imagen",
  "veo",
  "audio",
  "live",
  "robotics",
  "computer-use",
  "-image",
  "deep-research",
];

export interface GeminiOptions {
  apiKey: string;
  textModel?: string;
  textFallbackModel?: string;
  ttsModel?: string;
  embeddingModel?: string;
  defaultVoice?: string;
}

interface DiscoveredModels {
  textModels: string[];
  ttsModels: string[];
}

function isAuthOrKeyError(err: AiProviderError): boolean {
  const msg = err.message.toLowerCase();
  return (
    err.status === 401 ||
    err.status === 403 ||
    msg.includes("api key") ||
    msg.includes("api_key") ||
    msg.includes("permission")
  );
}

function shouldFallbackModelError(err: unknown): boolean {
  if (!(err instanceof AiProviderError)) return false;
  if (isAuthOrKeyError(err)) return false;
  const msg = err.message.toLowerCase();
  return (
    err.status === 503 ||
    err.status === 429 ||
    err.status === 404 ||
    err.status === 400 ||
    msg.includes("no longer available") ||
    msg.includes("not found") ||
    msg.includes("is not supported") ||
    msg.includes("deprecated")
  );
}

function isWavBuffer(buf: Buffer): boolean {
  return (
    buf.length >= 44 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WAVE"
  );
}

function normalizeAudioPayload(raw: Buffer, mimeType = "") {
  if (isWavBuffer(raw) || mimeType.toLowerCase().includes("audio/wav")) {
    const sampleRate =
      isWavBuffer(raw) ? raw.readUInt32LE(24) || 24000 : parseSampleRate(mimeType);
    const byteRate =
      isWavBuffer(raw) ? raw.readUInt32LE(28) || sampleRate * 2 : sampleRate * 2;
    const dataBytes = Math.max(0, raw.length - 44);
    return {
      wav: raw,
      sampleRate,
      durationSec: byteRate > 0 ? dataBytes / byteRate : 0,
    };
  }

  const sampleRate = parseSampleRate(mimeType);
  return {
    wav: pcmToWav(raw, sampleRate),
    sampleRate,
    durationSec: raw.length / (sampleRate * 2),
  };
}

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  private textModel: string;
  private readonly explicitTextModel: boolean;
  private readonly textFallback: string;
  private readonly explicitTextFallback: boolean;
  private ttsModel: string;
  private readonly explicitTtsModel: boolean;
  private readonly embeddingModel: string;
  private readonly defaultVoice: string;
  private discovered: DiscoveredModels | null = null;

  constructor(
    private readonly apiKey: string,
    opts: Omit<GeminiOptions, "apiKey"> = {},
  ) {
    if (!apiKey) throw new AiProviderError("Gemini API kaliti bo'sh");
    this.explicitTextModel = Boolean(opts.textModel);
    this.explicitTextFallback = Boolean(opts.textFallbackModel);
    this.explicitTtsModel = Boolean(opts.ttsModel);
    this.textModel = opts.textModel ?? "gemini-3.8-flash";
    this.textFallback = opts.textFallbackModel ?? "gemini-3.8-flash-lite";
    this.ttsModel = opts.ttsModel ?? "gemini-3.8-flash-tts";
    this.embeddingModel = opts.embeddingModel ?? "gemini-embedding-001";
    this.defaultVoice = opts.defaultVoice ?? "Kore";
  }

  /**
   * Ushbu API kalitda faol bo'lgan Gemini matn va TTS modellarini aniqlaydi.
   */
  async getAvailableModels(): Promise<DiscoveredModels> {
    if (this.discovered && this.discovered.textModels.length > 0) {
      return this.discovered;
    }

    try {
      const res = await fetch(`${BASE}/models?key=${this.apiKey}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new AiProviderError(
          data.error?.message ?? `Gemini modellari ro'yxatini olib bo'lmadi (${res.status})`,
          res.status,
        );
      }

      const data = (await res.json()) as {
        models?: Array<{
          name?: string;
          supportedGenerationMethods?: string[];
        }>;
      };

      const genModels = (data.models ?? [])
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => (m.name ?? "").replace(/^models\//, ""))
        .filter(Boolean);

      const ttsModels = genModels.filter((id) => id.includes("tts"));
      const textModels = genModels.filter(
        (id) =>
          id.includes("gemini") &&
          !EXCLUDED_TEXT_MODEL_KEYWORDS.some((kw) => id.includes(kw)),
      );

      this.discovered = { textModels, ttsModels };
      return this.discovered;
    } catch (err) {
      if (err instanceof AiProviderError) throw err;
      return {
        textModels: [this.textModel, this.textFallback],
        ttsModels: [this.ttsModel],
      };
    }
  }

  private async resolveCandidateTextModels(): Promise<string[]> {
    const defaults = [
      this.textModel,
      ...(this.explicitTextFallback ? [this.textFallback] : []),
      ...PREFERRED_TEXT_MODELS,
      this.textFallback,
    ];
    try {
      const { textModels } = await this.getAvailableModels();
      if (textModels.length === 0) {
        return Array.from(new Set(defaults));
      }

      const rankedAvailable = [
        ...PREFERRED_TEXT_MODELS.filter((m) => textModels.includes(m)),
        ...textModels.filter(
          (m) =>
            !PREFERRED_TEXT_MODELS.includes(m) &&
            !m.includes("1.5") &&
            !m.includes("2.0"),
        ),
      ];

      if (this.explicitTextModel) {
        return Array.from(new Set([this.textModel, ...rankedAvailable, ...defaults]));
      }
      return Array.from(new Set([...rankedAvailable, ...defaults]));
    } catch (err) {
      if (err instanceof AiProviderError && isAuthOrKeyError(err)) {
        throw err;
      }
      return Array.from(new Set(defaults));
    }
  }

  private async resolveCandidateTtsModels(): Promise<string[]> {
    const defaults = [this.ttsModel, ...PREFERRED_TTS_MODELS];
    try {
      const { ttsModels } = await this.getAvailableModels();
      if (ttsModels.length === 0) {
        return Array.from(new Set(defaults));
      }

      const rankedAvailable = [
        ...PREFERRED_TTS_MODELS.filter((m) => ttsModels.includes(m)),
        ...ttsModels.filter((m) => !PREFERRED_TTS_MODELS.includes(m)),
      ];

      if (this.explicitTtsModel) {
        return Array.from(new Set([this.ttsModel, ...rankedAvailable, ...defaults]));
      }
      return Array.from(new Set([...rankedAvailable, ...defaults]));
    } catch (err) {
      if (err instanceof AiProviderError && isAuthOrKeyError(err)) {
        throw err;
      }
      return Array.from(new Set(defaults));
    }
  }

  private async post<T>(
    model: string,
    method: string,
    body: unknown,
    maxRetries = 2,
  ): Promise<T> {
    let attempt = 0;
    while (attempt <= maxRetries) {
      const res = await fetch(`${BASE}/models/${model}:${method}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        return (await res.json()) as T;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: { message: string } };
      const retryable = res.status === 429 || res.status === 503;

      if (retryable && attempt < maxRetries) {
        attempt++;
        const delay = attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw new AiProviderError(
        data.error?.message ?? `Gemini xatosi (${res.status})`,
        res.status,
        retryable,
      );
    }
    throw new AiProviderError("Gemini so'rovi amalga oshmadi", 500, false);
  }

  async generateText(prompt: string, opts: TextOptions = {}): Promise<TextResult> {
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      ...(opts.skill
        ? { systemInstruction: { parts: [{ text: opts.skill }] } }
        : {}),
      generationConfig: {
        ...(opts.jsonMode ? { responseMimeType: "application/json" } : {}),
        ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts.maxOutputTokens
          ? { maxOutputTokens: opts.maxOutputTokens }
          : {}),
      },
    };

    const models = await this.resolveCandidateTextModels();
    let lastErr: unknown;
    for (const model of models) {
      try {
        const data = await this.post<any>(model, "generateContent", body);
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p: any) => p.text ?? "")
          .join("");
        const u = data.usageMetadata ?? {};
        this.textModel = model;
        return {
          text,
          model,
          usage: {
            promptTokens: u.promptTokenCount ?? 0,
            outputTokens: u.candidatesTokenCount ?? 0,
            totalTokens: u.totalTokenCount ?? 0,
          },
        };
      } catch (err) {
        lastErr = err;
        if (shouldFallbackModelError(err)) continue;
        throw err;
      }
    }
    throw lastErr;
  }

  async generateSpeech(
    text: string,
    opts: { voice?: string } = {},
  ): Promise<SpeechResult> {
    const voice = opts.voice ?? this.defaultVoice;
    const models = await this.resolveCandidateTtsModels();
    let lastErr: unknown;

    for (const model of models) {
      const isModernVerbatimTts = model.includes("3.8") || model.includes("3.5");
      const partPayload = isModernVerbatimTts
        ? {
            text,
            speechMetadata: { style: "Natural, clear, engaging Northern Uzbek narration" },
          }
        : { text: `Speak in Uzbek (Northern Uzbek), natural and clear.\n\n${text}` };

      try {
        const data = await this.post<any>(model, "generateContent", {
          contents: [{ role: "user", parts: [partPayload] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          },
        });

        const part = data.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData?.data,
        );
        if (!part) throw new AiProviderError("TTS audio qaytarmadi");

        const raw = Buffer.from(part.inlineData.data, "base64");
        const { wav, sampleRate, durationSec } = normalizeAudioPayload(
          raw,
          part.inlineData.mimeType,
        );
        this.ttsModel = model;
        return {
          wav,
          sampleRate,
          durationSec,
          model,
          voice,
        };
      } catch (err) {
        lastErr = err;
        // Agar model `speechMetadata` maydonini qo'llab-quvvatlamasa, toza text bilan qayta urinamiz
        if (
          err instanceof AiProviderError &&
          err.status === 400 &&
          err.message.toLowerCase().includes("speechmetadata")
        ) {
          try {
            const retryData = await this.post<any>(model, "generateContent", {
              contents: [{ role: "user", parts: [{ text }] }],
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
              },
            });
            const retryPart = retryData.candidates?.[0]?.content?.parts?.find(
              (p: any) => p.inlineData?.data,
            );
            if (!retryPart) throw new AiProviderError("TTS audio qaytarmadi");
            const raw = Buffer.from(retryPart.inlineData.data, "base64");
            const { wav, sampleRate, durationSec } = normalizeAudioPayload(
              raw,
              retryPart.inlineData.mimeType,
            );
            this.ttsModel = model;
            return { wav, sampleRate, durationSec, model, voice };
          } catch (retryErr) {
            lastErr = retryErr;
          }
        }
        if (shouldFallbackModelError(lastErr)) continue;
        throw lastErr;
      }
    }
    throw lastErr;
  }

  async embed(texts: string[]): Promise<EmbeddingResult> {
    const data = await this.post<any>(this.embeddingModel, "batchEmbedContents", {
      requests: texts.map((text) => ({
        model: `models/${this.embeddingModel}`,
        content: { parts: [{ text }] },
      })),
    });
    return {
      embeddings: (data.embeddings ?? []).map((e: any) => e.values),
      model: this.embeddingModel,
    };
  }

  async checkConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const r = await this.generateText("Salom deb javob bering.", {
        maxOutputTokens: 64,
      });
      return { ok: true, message: `Ulandi (${r.model})` };
    } catch (err) {
      const msg = err instanceof AiProviderError ? err.message : String(err);
      return { ok: false, message: msg.slice(0, 200) };
    }
  }
}
