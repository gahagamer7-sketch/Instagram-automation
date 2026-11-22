// GitHub Actions render worker'ining kirish nuqtasi.
// Oqim: jobs jadvalidan navbatdagi produce job'ni oladi ->
// nisha/g'oya -> ssenariy (Gemini + skill) -> TTS -> render -> QA ->
// tayyor videoni Blob/R2'ga yuklaydi -> video status = "ready".
//
// Har bosqich resumable: xato bo'lsa job holati va xatosi DB'ga yoziladi,
// keyingi ishga tushishda oxirgi muvaffaqiyatli bosqichdan davom etadi.

async function main() {
  const jobId = process.env.JOB_ID;
  console.log(`[worker] boshlandi (jobId=${jobId ?? "navbatdagi"})`);

  // TODO: bosqichma-bosqich pipeline implementatsiyasi (1-bosqich 3-hafta)

  console.log("[worker] tugadi");
}

main().catch((err) => {
  console.error("[worker] xato:", err);
  process.exit(1);
});
