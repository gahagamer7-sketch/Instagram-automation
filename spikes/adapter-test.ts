// packages/ai adapterining jonli testi: matn (skill bilan), TTS, embeddings.
// Ishga tushirish: GEMINI_API_KEY=<kalit> pnpm exec tsx spikes/adapter-test.ts

import { writeFileSync, mkdirSync } from "node:fs";
import { createProvider } from "../packages/ai/src/index.js";

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("XATO: GEMINI_API_KEY kerak.");
  process.exit(1);
}

async function main() {
  const ai = createProvider("gemini", key);
  mkdirSync("../../spikes/out", { recursive: true });

  console.log("1) Matn + skill injection...");
  const skill =
    "Sen o'zbek tilida qisqa, aniq va do'stona gapirasan. Javobni 2 gapdan oshirma.";
  const text = await ai.generateText(
    "Moliyaviy savodxonlik nima? Bir gapda tushuntir.",
    { skill },
  );
  console.log(`   ✓ [${text.model}] ${text.text.slice(0, 120)}`);
  console.log(`   tokens: ${JSON.stringify(text.usage)}`);

  console.log("2) TTS (WAV)...");
  const speech = await ai.generateSpeech(text.text);
  writeFileSync("../../spikes/out/adapter_test.wav", speech.wav);
  console.log(
    `   ✓ ${speech.model}/${speech.voice}: ${speech.durationSec.toFixed(1)} s, ${speech.sampleRate} Hz -> spikes/out/adapter_test.wav`,
  );

  console.log("3) Embeddings...");
  const emb = await ai.embed(["pul yig'ish", "ob-havo bugun"]);
  console.log(
    `   ✓ ${emb.model}: ${emb.embeddings.length} vektor, o'lcham ${emb.embeddings[0]?.length}`,
  );

  console.log("4) checkConnection...");
  console.log("   ", JSON.stringify(await ai.checkConnection()));

  console.log("\nHammasi ishladi ✓");
}

main().catch((err) => {
  console.error("XATO:", err);
  process.exit(1);
});
