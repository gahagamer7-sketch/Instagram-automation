// Bosqich 0 spike #2: Gemini TTS o'zbek talaffuzini tekshirish.
// Bir nechta model va ovozni sinab, natijani WAV faylga saqlaydi.
// Ishga tushirish: GEMINI_API_KEY=<kalit> node spikes/tts-test.mjs

import { writeFileSync, mkdirSync } from "node:fs";

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("XATO: GEMINI_API_KEY env o'zgaruvchisi kerak.");
  process.exit(1);
}

const TEXT =
  "Assalomu alaykum! Bu AutoChannel tizimining ovoz sinovi. " +
  "Bugun biz moliyaviy savodxonlik haqida gaplashamiz. " +
  "Pulni to'g'ri boshqarish — o'z kelajagingizga qilingan eng yaxshi sarmoya.";

// TZ'da: gemini-3.8-flash-lite-tts; zaxira variantlar ham sinaladi.
const MODELS = (process.env.GEMINI_TTS_MODELS ||
  "gemini-3.8-flash-lite-tts,gemini-2.5-flash-preview-tts")
  .split(",")
  .map((m) => m.trim());

const VOICES = (process.env.GEMINI_TTS_VOICES || "Kore,Puck,Charon,Zephyr")
  .split(",")
  .map((v) => v.trim());

// PCM (audio/L16) uchun WAV sarlavhasi
function toWav(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

function parseRate(mimeType = "") {
  const m = mimeType.match(/rate=(\d+)/);
  return m ? Number(m[1]) : 24000;
}

mkdirSync("spikes/out", { recursive: true });
let ok = 0;

outer: for (const model of MODELS) {
  for (const voice of VOICES) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: TEXT }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice, languageCode: "uz-UZ" },
          },
        },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      console.log(`✗ ${model} / ${voice}: (${res.status}) ${data.error?.message?.slice(0, 120)}`);
      if (res.status === 404) continue outer; // model mavjud emas — keyingi model
      continue;
    }

    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) {
      console.log(`✗ ${model} / ${voice}: audio qaytmadi`);
      continue;
    }

    const pcm = Buffer.from(part.inlineData.data, "base64");
    const rate = parseRate(part.inlineData.mimeType);
    const file = `spikes/out/tts_${model.replace(/[^a-z0-9.]/gi, "_")}_${voice}.wav`;
    writeFileSync(file, toWav(pcm, rate));
    console.log(`✓ ${model} / ${voice}: ${file} (${(pcm.length / (rate * 2)).toFixed(1)} s, ${rate} Hz)`);
    ok++;
  }
}

if (ok === 0) {
  console.error("\nHech qanday kombinatsiya ishlamadi — model nomlari/kvota tekshirilsin.");
  process.exit(1);
}
console.log(`\n${ok} ta audio saqlandi. spikes/out/ papkasini eshitib, talaffuzni baholang.`);
