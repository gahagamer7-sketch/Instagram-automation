export type AnimationStyleId =
  | "deep-dive"
  | "night-file"
  | "inside-out"
  | "stick-story"
  | "paper-atlas"
  | "tall-tale";

export interface AnimationStyleProfile {
  id: AnimationStyleId;
  name: string;
  tag: string;
  durationRange: string;
  defaultVoiceId: "Puck" | "Kore" | "Fenrir" | "Aoede";
  previewImage: string;
  summary: string;
  bestFor: string;
  palette: {
    bg: string;
    primary: string;
    secondary: string;
    highlight: string;
  };
  renderConfig: {
    bgHex: string;
    primaryAssHex: string;
    highlightAssHex: string;
    outlineAssHex: string;
    fontName: string;
    headerLabel: string;
  };
  /**
   * SKILL.md va tegishli STYLE.md faylidan olingan to'liq AI yo'riqnoma.
   */
  aiGuide: string;
}

export const ANIMATION_STYLES: AnimationStyleProfile[] = [
  {
    id: "deep-dive",
    name: "Deep Dive 3D",
    tag: "3D · Ilm-fan & Tana",
    durationRange: "30–45s",
    defaultVoiceId: "Puck",
    previewImage: "/animation-styles/deep-dive.png",
    summary:
      "3D vizual tushuntirish: real hayot kadri → ko'k-cyan X-ray rentgen → ichki mikro sayohat. \"Nima bo'ladi agar...\" mavzulari uchun.",
    bestFor: "Tana, sog'lik, ilm-fan va \"Nima bo'ladi agar...\" savollari",
    palette: {
      bg: "#0F172A",
      primary: "#4FD1E8",
      secondary: "#B8283A",
      highlight: "#FFD43B",
    },
    renderConfig: {
      bgHex: "0x0F172A",
      primaryAssHex: "&H00FFFFFF",
      highlightAssHex: "&H00E8D14F",
      outlineAssHex: "&H001A120B",
      fontName: "Arial",
      headerLabel: "DEEP DIVE 3D",
    },
    aiGuide: `USLUB: Deep Dive 3D (Zack D. Films uslubidagi ilmiy/anatomik 3D tushuntirish).
SSENARIY TUZILISHI (30-45s, 8-12 ta tez kadr):
1. Kirish (0-3s): Kutilmagan "Nima bo'ladi agar..." savoli bilan real hayotiy kadrdan boshla.
2. X-ray o'tish: Qahramon tanasi shaffof cyan (#4FD1E8) X-ray rentgen ko'rinishiga o'tadi.
3. Mikro ichki dunyo: Kamera qon tomirlari yoki organlar ichiga kiradi (chuqur qizil #B8283A muhit, yorug' fokus).
4. Burilish nuqtasi (Twist) va Loop yakun: Afsonani fosh qil yoki kutilmagan oqibatni ko'rsatib, boshiga bog'lanadigan kuchli yakun yasang.
QOIDALAR:
- Har bir gap jonli do'stga gapirgandek ravon va bog'lovchili bo'lsin; kadrlar har 1.5–3.5 soniyada almashsin.
- Qonli/dahshatli sahna yo'q: xavf faqat X-ray nuri, qizil signal va ogohlantirish belgisi sifatida tasvirlanadi.
- Ekran matni (screenText): 1–3 so'z, bitta muhim so'zni *SO'Z* shaklida ajratib yoz (masalan: "O'PKA *TO'LDI*", "KISLOROD *TUGADI*").
- visualDirection: Har bir shot uchun 3D kamera harakati (push-in, orbit), dunyo turi (Real / X-ray / Mikro) va obyektni aniq yoz.`,
  },
  {
    id: "night-file",
    name: "Night File 3D",
    tag: "Detektiv & Sir",
    durationRange: "30–45s",
    defaultVoiceId: "Fenrir",
    previewImage: "/animation-styles/night-file.png",
    summary:
      "Sirli va detektiv hikoyalar: bitta yorug'lik manbali qorong'u 3D sahna, yuzsiz figuralar, qizil dalillar va bosma mashinka sanalari.",
    bestFor: "Ochilmagan sirlar, detektiv voqealar va g'ayrioddiy hodisalar",
    palette: {
      bg: "#090A0F",
      primary: "#DC2626",
      secondary: "#F5EFE6",
      highlight: "#EF4444",
    },
    renderConfig: {
      bgHex: "0x090A0F",
      primaryAssHex: "&H00E6EFF5",
      highlightAssHex: "&H002626DC",
      outlineAssHex: "&H00050508",
      fontName: "Courier New",
      headerLabel: "NIGHT FILE",
    },
    aiGuide: `USLUB: Night File 3D (Sirli detektiv va hujjatli tergov uslubi).
SSENARIY TUZILISHI (30-45s, 8-11 ta sokin va tarang kadr):
1. Sana va joy muhri (0-3s): Aniq sana va joy nomi bilan boshla (masalan: "1971-YIL, NOYABR").
2. Sirli qahramon: Qorong'u 3D xonada yagona chiroq nuri ostida yuzsiz figura (qizil nur bilan ajratilgan).
3. Dalillar zanjiri: Har bir qadamda hujjat, chipta, polaroid surat yoki qizil doira bilan belgilangan dalil.
4. Ochiq savol (Unsolved): Voqeaning eng g'alati burilishi va haligacha javobsiz qolgan sir bilan yakunla.
QOIDALAR:
- Ohang: vazmin, sokin, tergovchi ovozi kabi tarang. Kadrlar 3–5 soniyali sekin yaqinlashishlar bilan.
- Hech qanday zo'ravonlik yoki qurol tasviri yo'q — faqat dalillar va atmosfera.
- Ekran matni (screenText): 2–4 so'z, bosma mashinka uslubida, bitta kalit so'zni *QIZIL* uchun belgilang (masalan: "ARXIV *OCHILDI*", "IZSIZ *G'OYIB*").
- visualDirection: Qorong'u sahna, bitta yorug'lik konusi, dalil papkasi yoki qizil marker tasvirini yoz.`,
  },
  {
    id: "inside-out",
    name: "Inside Out 2D",
    tag: "2D Vektor · Rentgen",
    durationRange: "25–40s",
    defaultVoiceId: "Puck",
    previewImage: "/animation-styles/inside-out.png",
    summary:
      "Tekis 2D vektor animatsiya: sodda qahramon, ko'k rentgen kesimlari, tezkor 1.5–3s kadrlar va sariq kalit so'zli yirik subtitrlar.",
    bestFor: "Qisqa ilmiy faktlar, ovqat/odat ta'siri va afsonalarni buzish",
    palette: {
      bg: "#1A1A1E",
      primary: "#4FD1E8",
      secondary: "#E57A8A",
      highlight: "#FFD43B",
    },
    renderConfig: {
      bgHex: "0x1A1A1E",
      primaryAssHex: "&H00FFFFFF",
      highlightAssHex: "&H003BD4FF",
      outlineAssHex: "&H001E1A1A",
      fontName: "Arial",
      headerLabel: "INSIDE OUT 2D",
    },
    aiGuide: `USLUB: Inside Out 2D (Sodda 2D vektor qahramon va rentgen kesimlari).
SSENARIY TUZILISHI (25-40s, 9-12 ta tezkor kadr):
1. Hook savol (0-3s): Qahramon va mavzu obyektini ko'rsatib keskin savol ber.
2. Ichki X-ray: Vektor qahramon butunlay cyan (#4FD1E8) rentgen rejimiga o'tadi.
3. Afsonani buzish (Red X): Keng tarqalgan noto'g'ri fikrni qizil X belgisi bilan rad et.
4. Asl haqiqat va Burilish: Aslida nima sodir bo'lishini ko'rsat va qahramonning kameraga qaragan hazilomuz/kuchli gapi bilan yakunla.
QOIDALAR:
- Tekis 2D shakllar, yorqin kontrast: X-ray cyan faqat tana ichida, qizil X xavf/xato uchun, sariq #FFD43B urg'u so'z uchun.
- Har 1.5–3 soniyada yangi vizual kadr va qisqa reaktsiya (hayrat, yutish, tabassum).
- Ekran matni (screenText): 1–3 so'z, bitta *SARIQ* kalit so'z bilan (masalan: "7 YIL *QOLADI?*", "TO'LIQ *AFSONA*").
- visualDirection: 2D qahramon holati, rentgen qismi yoki katta vektor ikona (taqvim, soat, yurak) ko'rsat.`,
  },
  {
    id: "stick-story",
    name: "Stick Story",
    tag: "Hayotiy · Layfxak",
    durationRange: "30–45s",
    defaultVoiceId: "Aoede",
    previewImage: "/animation-styles/stick-story.png",
    summary:
      "\"Nima qilgan bo'lardingiz?\" hayotiy qo'llanma: ifodali ko'zli tayoqcha qahramonlar, kun/tun xonalari va oltin qadam kartalari.",
    bestFor: "Qiyin vaziyatlarda omon qolish, layfxaklar va amaliy qadamlar",
    palette: {
      bg: "#162032",
      primary: "#F59E0B",
      secondary: "#10B981",
      highlight: "#FBBF24",
    },
    renderConfig: {
      bgHex: "0x162032",
      primaryAssHex: "&H00FFFFFF",
      highlightAssHex: "&H0024BFFB",
      outlineAssHex: "&H000F172A",
      fontName: "Arial",
      headerLabel: "STICK STORY",
    },
    aiGuide: `USLUB: Stick Story ("Nima qilgan bo'lardingiz?" — tayoqcha qahramonli qadam-baqadam qo'llanma).
SSENARIY TUZILISHI (30-45s, 9-12 ta qadamli kadr):
1. Muammo (Tun xonasi): Qahramon qiyin yoki favqulodda vaziyatga tushib qoladi (masalan, chiroq 3 kunga o'chsa).
2. Oltin Qadam Kartalari: "1-QADAM", "2-QADAM", "3-QADAM" shaklida aniq va foydali harakatlar.
3. Xato vs To'g'ri: Noto'g'ri ish qizil X, to'g'ri yechim yashil tasdiq belgisi bilan ko'rsatiladi.
4. Baxtli yakun (Yorug' kun): Muammo hal bo'ladi va tomoshabinni saqlab qo'yishga undaydi.
QOIDALAR:
- Har bir jumlada bitta aniq vizual harakat; jonli, tez va amaliy nutq.
- Ekran matni (screenText): 2–4 so'z, qadam raqami yoki asosiy harakat *OLTIN* rangda (masalan: "*1-QADAM:* SUV SAQLANG", "EShikni *OCHMANG*").
- visualDirection: Qahramon kayfiyati (qo'rquv, o'ylanish, g'alaba), xona yorug'ligi (tun/kun) va qo'ldagi buyumni tasvirla.`,
  },
  {
    id: "paper-atlas",
    name: "Paper Atlas",
    tag: "Tarix & Xarita",
    durationRange: "30–45s",
    defaultVoiceId: "Puck",
    previewImage: "/animation-styles/paper-atlas.png",
    summary:
      "Qog'oz aplikatsiya uslubidagi tarixiy hikoya: eski pergament xaritalar, qizil marshrut chiziqlari, oltin sana lentalari va muhrlar.",
    bestFor: "Tarixiy voqealar, shaharlar siri va \"Bu qanday sodir bo'ldi?\"",
    palette: {
      bg: "#231B12",
      primary: "#D4A843",
      secondary: "#B91C1C",
      highlight: "#FDE68A",
    },
    renderConfig: {
      bgHex: "0x231B12",
      primaryAssHex: "&H00C7F3FE",
      highlightAssHex: "&H0043A8D4",
      outlineAssHex: "&H00080C0F",
      fontName: "Georgia",
      headerLabel: "PAPER ATLAS",
    },
    aiGuide: `USLUB: Paper Atlas (Eski pergament va qirqma qog'oz uslubidagi tarixiy hujjatli video).
SSENARIY TUZILISHI (30-45s, 8-10 ta sahifali kadr):
1. Xarita va Sana lentasi (0-3s): Avval QAYERDA va QACHON ekanini ko'rsat (oltin sana lentasi).
2. Tarixiy shaxs va sabab: Qog'ozdan qirqilgan qahramonlar va tarixiy obyektlar orqali voqea zanjiri.
3. Qizil marshrut / oqibat: Harakat yo'nalishi yoki tarixiy burilish qizil chiziq bilan xaritada chiziladi.
4. Tarixiy iz: Voqeadan qolgan meros va yakuniy saboq.
QOIDALAR:
- Jang va qonli sahnalar yo'q — voqealar xaritalar, binolar, kemalar va natijalar orqali aytiladi.
- Hujjatli, salobatli hikoyachi ohangi; aniq tarixiy faktlarga tayansin.
- Ekran matni (screenText): 2–4 so'z, tarixiy sana yoki muhim nom *AJRATILGAN* holda (masalan: "*1666-YIL:* LONDON", "YONG'IN *CHIZIQLARI*").
- visualDirection: Eski xarita, qirqma qog'oz bino/kema, oltin muhr va qizil marshrut chizig'ini tasvirla.`,
  },
  {
    id: "tall-tale",
    name: "Tall Tale 3D",
    tag: "Qiziqarli Hikoya",
    durationRange: "40–60s",
    defaultVoiceId: "Kore",
    previewImage: "/animation-styles/tall-tale.png",
    summary:
      "Kulgili va aqlli real voqealar: quyoshli 3D shaharcha ichida 2D multfilm odamlar, jonli mimika va 1 so'zli ritmik subtitrlar.",
    bestFor: "G'alati real voqealar, aqlli hiylalar va qiziqarli storytime",
    palette: {
      bg: "#1E293B",
      primary: "#F97316",
      secondary: "#38BDF8",
      highlight: "#FACC15",
    },
    renderConfig: {
      bgHex: "0x1E293B",
      primaryAssHex: "&H00FFFFFF",
      highlightAssHex: "&H0015CCFA",
      outlineAssHex: "&H000F172A",
      fontName: "Arial",
      headerLabel: "TALL TALE 3D",
    },
    aiGuide: `USLUB: Tall Tale 3D (Quyoshli 3D dunyoda 2D multfilm qahramonlari bilan aql bovar qilmas real hikoya).
SSENARIY TUZILISHI (40-60s, 10-14 ta tezkor reaktsiyali kadr):
1. Eng hayratlanarli fakt (0-3s): To'g'ridan-to'g'ri eng aqlga sig'mas faktdan boshla!
2. Ortga qaytarish ("Gap shundaki..."): Bu ish qanday va nima uchun sodir bo'lganini qadamma-qadam tushuntir.
3. Mimika va Burilish: Har bir kichik burilishda qahramonning yuz ifodasi (ayyorlik, hayrat, xavotir) almashadi.
4. Punchline yakun: Boshidagi gapga bog'lanadigan aqlli yoki kulgili yakuniy xulosa.
QOIDALAR:
- Nutq: quvnoq, tez, jonli hikoyachi uslubida. Har 1.5–3 soniyada yangi kadr.
- Ekran matni (screenText): Juda qisqa 1–2 so'zli zarbali matnlar (masalan: "*POCHTA ORQALI*", "QONUN *BO'SHLIG'I*", "*TAQIQLANDI*").
- visualDirection: Quyoshli 3D ko'cha/do'kon/poyezd foni va 2D qahramon mimikasi + qo'ldagi buyumni tasvirla.`,
  },
];

export function getAnimationStyle(id?: string): AnimationStyleProfile {
  return ANIMATION_STYLES.find((s) => s.id === id) ?? ANIMATION_STYLES[0]!;
}
