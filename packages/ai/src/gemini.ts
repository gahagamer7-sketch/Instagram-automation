import {
  AiProvider,
  AiProviderError,
  EmbeddingResult,
  SpeechResult,
  TextOptions,
  TextResult,
} from "./types.js";
import { pcmToWav, parseSampleRate } from "./wav.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiOptions {
  apiKey: string;
  textModel?: string;
  textFallbackModel?: string;
  ttsModel?: string;
  embeddingModel?: string;
  defaultVoice?: string;
}

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  private readonly textModel: string;
  private readonly textFallback: string;
  private readonly ttsModel: string;
  private readonly embeddingModel: string;
  private readonly defaultVoice: string;

  constructor(
    private readonly apiKey: string,
    opts: Omit<GeminiOptions, "apiKey"> = {},
  ) {
    if (!apiKey) throw new AiProviderError("Gemini API kaliti bo'sh");
    this.textModel = opts.textModel ?? "gemini-3.5-flash";
    this.textFallback = opts.textFallbackModel ?? "gemini-flash-latest";
    this.ttsModel = opts.ttsModel ?? "gemini-3.8-flash-lite-tts";
    this.embeddingModel = opts.embeddingModel ?? "gemini-embedding-001";
    this.defaultVoice = opts.defaultVoice ?? "Kore";
  }

  private async post<T>(model: string, method: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE}/models/${model}:${method}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as T & { error?: { message: string } };
    if (!res.ok) {
      const retryable = res.status === 429 || res.status === 503;
      throw new AiProviderError(
        data.error?.message ?? `Gemini xatosi (${res.status})`,
        res.status,
        retryable,
      );
    }
    return data;
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

    const models = [this.textModel, this.textFallback];
    let lastErr: unknown;
    for (const model of models) {
      try {
        const data = await this.post<any>(model, "generateContent", body);
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p: any) => p.text ?? "")
          .join("");
        const u = data.usageMetadata ?? {};
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
        // 503 (model band) bo'lsa fallback modelga o'tamiz
        if (err instanceof AiProviderError && err.status === 503) continue;
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
    const data = await this.post<any>(this.ttsModel, "generateContent", {
      contents: [
        {
          role: "user",
          parts: [
            { text: `Speak in Uzbek (Northern Uzbek), natural and clear.\n\n${text}` },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });

    const part = data.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData?.data,
    );
    if (!part) throw new AiProviderError("TTS audio qaytarmadi");

    const pcm = Buffer.from(part.inlineData.data, "base64");
    const sampleRate = parseSampleRate(part.inlineData.mimeType);
    return {
      wav: pcmToWav(pcm, sampleRate),
      sampleRate,
      durationSec: pcm.length / (sampleRate * 2),
      model: this.ttsModel,
      voice,
    };
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
