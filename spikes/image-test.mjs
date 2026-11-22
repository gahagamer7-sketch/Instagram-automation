// Bosqich 0 spike #3: Gemini rasm generatsiyasi bepul tarifda mavjudmi?
// Avatar uchun 1080x1080 uslubidagi test rasmini yaratadi.
// Ishga tushirish: GEMINI_API_KEY=<kalit> node spikes/image-test.mjs

import { writeFileSync, mkdirSync } from "node:fs";

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("XATO: GEMINI_API_KEY env o'zgaruvchisi kerak.");
  process.exit(1);
}

const MODELS = (process.env.GEMINI_IMAGE_MODELS ||
  "gemini-2.5-flash-image,gemini-2.0-flash-preview-image-generation")
  .split(",")
  .map((m) => m.trim());

const PROMPT =
  "Minimalist flat logo for an Uzbek-language Instagram Reels channel about " +
  "financial literacy. Deep blue (#3B82F6) and indigo gradient, simple geometric " +
  "symbol readable inside a circle, no text, square composition.";

mkdirSync("spikes/out", { recursive: true });

for (const model of MODELS) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: PROMPT }] }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    console.log(`✗ ${model}: (${res.status}) ${data.error?.message?.slice(0, 140)}`);
    continue;
  }

  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) {
    console.log(`✗ ${model}: rasm qaytmadi (matnli javob bo'lishi mumkin)`);
    continue;
  }

  const ext = (part.inlineData.mimeType || "image/png").split("/")[1]?.split(";")[0] ?? "png";
  const file = `spikes/out/avatar_test_${model.replace(/[^a-z0-9.]/gi, "_")}.${ext}`;
  writeFileSync(file, Buffer.from(part.inlineData.data, "base64"));
  console.log(`✓ ${model}: ${file}`);
}

console.log("\nNatija spikes/out/ papkasida. Rasm chiqmasa — SVG/HTML shablon reja B.");
