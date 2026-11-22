// Provayder adapter interfeyslari — TZ 9: "Provoyderlar adapter orqali
// ulanadi, almashtirish oson". Boshqa provayder (masalan Edge-TTS) shu
// interfeyslarni implementatsiya qiladi.

export interface TextResult {
  text: string;
  usage?: { promptTokens: number; outputTokens: number; totalTokens: number };
  model: string;
}

export interface SpeechResult {
  wav: Buffer;
  sampleRate: number;
  durationSec: number;
  model: string;
  voice: string;
}

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
}

export interface TextOptions {
  /** Faol skill matni — system instruction sifatida beriladi (TZ 4.13) */
  skill?: string;
  /** JSON javob talab qilish (structured output) */
  jsonMode?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AiProvider {
  readonly name: string;
  generateText(prompt: string, opts?: TextOptions): Promise<TextResult>;
  generateSpeech(text: string, opts?: { voice?: string }): Promise<SpeechResult>;
  embed(texts: string[]): Promise<EmbeddingResult>;
  /** "Ulanishni tekshirish" uchun yengil test chaqiruvi */
  checkConnection(): Promise<{ ok: boolean; message: string }>;
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}
