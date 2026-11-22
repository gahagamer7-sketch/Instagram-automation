# Bosqich 0 — Spike testlari

Maqsad: loyihaning xavfli taxminlarini prototipda tekshirish (TZ 5.1).

## Tayyorgarlik: Gemini API kaliti

1. https://aistudio.google.com saytiga kiring (Google akkaunti bilan).
2. Chap menyu → **Get API key** → **Create API key** → kalitni nusxalang.
3. Kalitni hech kimga ko'rsatmang va repoga qo'ymang.

## Ishga tushirish (Git Bash'da, loyiha papkasida)

```bash
export GEMINI_API_KEY="sizning_kalit"

node spikes/key-check.mjs     # 1. kalit ishlaydimi (matn)
node spikes/tts-test.mjs      # 2. o'zbek TTS talaffuzi (eng muhimi!)
node spikes/image-test.mjs    # 3. rasm generatsiyasi bepul tarifda bormi
```

Natijalar `spikes/out/` papkasiga saqlanadi (`.gitignore`ga qo'shilgan).

## Baholash mezonlari

| Test | Muvaffaqiyat | Muvaffaqiyatsiz bo'lsa (reja B) |
|---|---|---|
| TTS | WAV fayllar eshitiladi, o'zbek talaffuzi qabul qilsa bo'ladigan darajada | Edge-TTS (bepul) yoki boshqa TTS provayderi — adapter orqali almashtiriladi |
| Rasm | Kamida bitta model avatar uslubidagi rasm qaytardi | SVG/HTML avatar shablonlari (TZ 4.1'da nazarda tutilgan) |
| Kalit | Matnli javob keldi | AI Studio'da qayta tekshirish; kvota/region muammosi |

## O'zgaruvchilar (ixtiyoriy)

- `GEMINI_TEXT_MODEL` — matn modeli (standart: `gemini-3.5-flash`)
- `GEMINI_TTS_MODELS` — vergul bilan TTS modellar ro'yxati
- `GEMINI_TTS_VOICES` — sinaladigan ovozlar (standart: Kore,Puck,Charon,Zephyr)
- `GEMINI_IMAGE_MODELS` — rasm modellar ro'yxati

## Natijalar (2026-11-22, bepul tarif)

| Test | Natija | Qaror |
|---|---|---|
| Kalit (matn) | ✓ `gemini-3.5-flash` ishlaydi; `gemini-3.8-flash` vaqtincha 503 (yuqori talab) | Matn modeli: `gemini-3.5-flash`, fallback `gemini-flash-latest` |
| TTS | ✓ `gemini-3.8-flash-lite-tts` va `gemini-3.8-flash-tts` — 4 tadan ovoz (Kore/Puck/Charon/Zephyr), 24 kHz WAV | Talaffuzni eshitib tasdiqlash kerak (spikes/out/) |
| Rasm | ✗ 429 kvota — bepul tarifda rasm generatsiyasi mavjud emas | **Reja B:** SVG/HTML avatar va cover shablonlari (TZ 4.1) |
| API o'zgarishi | `languageCode` endi `prebuiltVoiceConfig`da qabul qilinmaydi; til — prompt orqali | Adapter shu usulda quriladi |

Mavjud modellardan foydali topilmalar: `gemini-embedding-001` (g'oyalar semantik tekshiruvi), `gemini-3.5-transcribe` (subtitr alignment), `lyria-3.5` (fon musiqa, tekshirish kerak).

