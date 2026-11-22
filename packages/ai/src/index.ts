import { AiProvider } from "./types.js";
import { GeminiProvider, GeminiOptions } from "./gemini.js";

export * from "./types.js";
export { GeminiProvider, type GeminiOptions } from "./gemini.js";
export { pcmToWav, parseSampleRate } from "./wav.js";

/** Provayder fabrikasi: keyinroq boshqa provayderlar shu yerdan qo'shiladi. */
export function createProvider(
  provider: string,
  apiKey: string,
  opts: Omit<GeminiOptions, "apiKey"> = {},
): AiProvider {
  switch (provider) {
    case "gemini":
      return new GeminiProvider(apiKey, opts);
    default:
      throw new Error(`Noma'lum provayder: ${provider}`);
  }
}
