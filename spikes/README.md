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

- `GEMINI_TEXT_MODEL` — matn modeli (standart: `gemini-2.5-flash`)
- `GEMINI_TTS_MODELS` — vergul bilan TTS modellar ro'yxati
- `GEMINI_TTS_VOICES` — sinaladigan ovozlar (standart: Kore,Puck,Charon,Zephyr)
- `GEMINI_IMAGE_MODELS` — rasm modellar ro'yxati
