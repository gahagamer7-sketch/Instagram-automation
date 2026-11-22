// Bosqich 0 spike #1: Gemini API kalitini tekshirish (matn generatsiyasi).
// Ishga tushirish: GEMINI_API_KEY=<kalit> node spikes/key-check.mjs

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("XATO: GEMINI_API_KEY env o'zgaruvchisi kerak.");
  process.exit(1);
}

const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const body = {
  contents: [
    {
      role: "user",
      parts: [{ text: "Bitta gapda o'zbek tilida salom bering." }],
    },
  ],
};

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = await res.json();

if (!res.ok) {
  console.error(`XATO (${res.status}):`, data.error?.message ?? JSON.stringify(data));
  process.exit(1);
}

const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "(bo'sh)";
console.log("✓ Kalit ishlaydi. Model:", model);
console.log("Javob:", text);
console.log("Usage:", JSON.stringify(data.usageMetadata ?? {}));
