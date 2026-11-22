import { AiProvider } from "./types";
import { GeminiProvider, GeminiOptions } from "./gemini";

export * from "./types";
export { GeminiProvider, type GeminiOptions } from "./gemini";
export { pcmToWav, parseSampleRate } from "./wav";

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
