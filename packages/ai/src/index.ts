import { AiProvider } from "./types";
import { GeminiProvider, GeminiOptions } from "./gemini";
import { GroqProvider, GroqOptions } from "./groq";

export * from "./types";
export { GeminiProvider, type GeminiOptions } from "./gemini";
export { GroqProvider, type GroqOptions } from "./groq";
export { pcmToWav, parseSampleRate } from "./wav";

/** Provayder fabrikasi: Gemini va Groq (Llama 3.3 70B) */
export function createProvider(
  provider: string,
  apiKey: string,
  opts: Record<string, unknown> = {},
): AiProvider {
  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey, opts);
    case "groq":
      return new GroqProvider(apiKey, opts);
    default:
      throw new Error(`Noma'lum provayder: ${provider}`);
  }
}
