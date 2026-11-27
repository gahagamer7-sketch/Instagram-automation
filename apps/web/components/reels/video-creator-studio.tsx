"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  Clapperboard,
  Clock,
  Copy,
  Download,
  Film,
  Lightbulb,
  Maximize2,
  Palette,
  Play,
  Radio,
  Rocket,
  RotateCcw,
  Smartphone,
  Sparkles,
  Volume2,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  ANIMATION_STYLES,
  getAnimationStyle,
  type AnimationStyleId,
  type AnimationStyleProfile,
} from "@autochannel/core/styles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createVideoAction,
  suggestIdeasAction,
  type CreateVideoResponse,
} from "@/app/reels/actions";

interface VideoCreatorStudioProps {
  defaultNiche?: string;
}

const NISHE_CATEGORIES = [
  { id: "psixologiya", label: "Psixologiya & Miya", query: "Miyani chalg'ituvchi psixologik sirlar" },
  { id: "biznes", label: "Biznes & Pul", query: "Moliyaviy erkinlik va pulni ko'paytirish qoidalari" },
  { id: "texnologiya", label: "Texnologiya & AI", query: "Sun'iy intellekt va yangi texnologiyalar mo'jizasi" },
  { id: "talim", label: "Ta'lim & Fan", query: "Koinot va insoniyat haqida hayratlanarli faktlar" },
  { id: "faktlar", label: "Qiziqarli Faktlar", query: "Ko'pchilik bilmaydigan 3 ta qiziqarli haqiqat" },
  { id: "motivatsiya", label: "Motivatsiya & Intizom", query: "Har kuni ertalab muvaffaqiyatga undovchi odatlar" },
];

const VOICES = [
  {
    id: "Puck",
    name: "Puck",
    gender: "Erkak",
    tone: "Tiniq, ishonchli va rasmiy",
    desc: "Ilm-fan, tarix va ta'limiy videolar uchun ideal.",
  },
  {
    id: "Kore",
    name: "Kore",
    gender: "Ayol",
    tone: "Muloyim, jozibali va ravon",
    desc: "Qiziqarli hikoyalar va psixologiyaga mos.",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Erkak",
    tone: "Qat'iy, chuqur va baquvvat",
    desc: "Detektiv sirlar va hayratlanarli faktlar uchun.",
  },
  {
    id: "Aoede",
    name: "Aoede",
    gender: "Ayol",
    tone: "Jo'shqin, yorqin va ilhomlantiruvchi",
    desc: "Hayotiy qo'llanmalar va tezkor layfxaklar uchun.",
  },
];

export function VideoCreatorStudio({
  defaultNiche = "Foydali Ma'lumotlar",
}: VideoCreatorStudioProps) {
  const [selectedStyle, setSelectedStyle] = useState<AnimationStyleId>("deep-dive");
  const [previewStyleModal, setPreviewStyleModal] = useState<AnimationStyleProfile | null>(null);

  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(NISHE_CATEGORIES[0].id);
  const [aiProvider, setAiProvider] = useState<"groq" | "gemini">("groq");
  const [voiceId, setVoiceId] = useState("Puck");
  const [voiceManuallyChanged, setVoiceManuallyChanged] = useState(false);
  const [hookStyle, setHookStyle] = useState("Savol & Qiziqish");

  const [suggesting, setSuggesting] = useState(false);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState(1);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateVideoResponse | null>(null);

  const [copiedCaption, setCopiedCaption] = useState(false);

  const activeStyle = getAnimationStyle(selectedStyle);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setElapsedSec(0);
      timer = setInterval(() => {
        setElapsedSec((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  function handleSelectStyle(style: AnimationStyleProfile) {
    setSelectedStyle(style.id);
    if (!voiceManuallyChanged) {
      setVoiceId(style.defaultVoiceId);
    }
  }

  async function handleSuggestIdeas(categoryQuery?: string) {
    setSuggesting(true);
    const nicheTarget = categoryQuery || defaultNiche;
    try {
      const res = await suggestIdeasAction(nicheTarget, aiProvider, selectedStyle);
      if (res.ok && res.ideas.length > 0) {
        setSuggestedIdeas(res.ideas);
      }
    } finally {
      setSuggesting(false);
    }
  }

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setProgressStage(1);

    const t1 = setTimeout(() => setProgressStage(2), 2500);
    const t2 = setTimeout(() => setProgressStage(3), 5500);
    const t3 = setTimeout(() => setProgressStage(4), 9000);
    const t4 = setTimeout(() => setProgressStage(5), 13000);

    try {
      const res = await createVideoAction({
        topic: topic.trim(),
        styleId: selectedStyle,
        aiProvider,
        voiceId,
        hookStyle,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      if (!res.ok) {
        setError(res.message || "Video yaratishda xatolik yuz berdi.");
      } else {
        setResult(res);
      }
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setError(err instanceof Error ? err.message : "Video yaratishda kutilmagan xatolik.");
    } finally {
      setLoading(false);
    }
  }

  function copyCaption() {
    if (!result?.caption) return;
    const text = `${result.caption}\n\n${(result.hashtags || []).join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }

  function resetStudio() {
    setResult(null);
    setError(null);
    setTopic("");
  }

  const stageItems = [
    {
      step: 1,
      label: `1. ${activeStyle.name} uslubida AI ssenariy`,
    },
    { step: 2, label: "2. Tabiiy o'zbekcha ovoz (TTS)" },
    { step: 3, label: "3. Fon media va vizual kadrlar" },
    { step: 4, label: "4. Uslubga mos subtitrlar montaji" },
    { step: 5, label: "5. 1080×1920 Full HD render" },
  ];

  return (
    <div className="space-y-6">
      {/* Studiya Yuqori Sarlavha Paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-brand text-white shadow-[0_6px_20px_rgba(124,58,237,0.4)]">
            <Film className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-text">
                Katta Video Studiya
              </h1>
              <Badge tone="primary" className="gap-1 py-0.5 px-2.5 text-[11px] font-semibold">
                <Sparkles className="h-3 w-3" aria-hidden />
                6 Animatsiya Uslubi
              </Badge>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm text-muted">
              Uslubni tanlang — AI uning ssenariy tuzilishi, ritmi va vizual qoidalarini o&apos;rganib video yaratadi.
            </p>
          </div>
        </div>

        <Badge tone="success" className="gap-1.5 py-1.5 px-3 text-xs w-fit">
          <Radio className="h-3.5 w-3.5 animate-pulse text-success" aria-hidden />
          {activeStyle.name} faol
        </Badge>
      </div>

      {/* 2 USTUNLI ASOSIY ISH STANSIYASI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* CHAP USTUN: KREATIV BOSHQARUV MARKAZI (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. ANIMATSIYA USLUBINI TANLASH */}
          <section className="card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-violet-300 border border-primary/40 text-xs font-bold">
                  01
                </span>
                <div>
                  <h2 className="font-heading text-base font-bold text-text">
                    Animatsiya Uslubini Tanlang
                  </h2>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-cyan">
                <Palette className="h-3.5 w-3.5" aria-hidden />
                AI uslub qoidalarini avtomatik qo&apos;llaydi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {ANIMATION_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <div
                    key={style.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectStyle(style)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectStyle(style);
                      }
                    }}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/12 ring-2 ring-primary/45 shadow-[0_0_26px_rgba(124,58,237,0.28)]"
                        : "border-border bg-surface-2/60 hover:border-primary/45 hover:bg-surface-2"
                    }`}
                  >
                    {/* Preview Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-background border-b border-border">
                      <img
                        src={style.previewImage}
                        alt={style.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />

                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                        <span className="font-mono rounded-md bg-black/70 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-white border border-white/10">
                          {style.durationRange}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewStyleModal(style);
                          }}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-black/70 text-white/90 hover:bg-primary hover:text-white transition border border-white/15"
                          title="Uslub namunasini kattalashtirib ko'rish"
                          aria-label={`${style.name} namunasini kattalashtirish`}
                        >
                          <Maximize2 className="h-3 w-3" aria-hidden />
                        </button>
                      </div>

                      {/* Palette swatches */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2 py-1 border border-white/10">
                        {[
                          style.palette.bg,
                          style.palette.primary,
                          style.palette.secondary,
                          style.palette.highlight,
                        ].map((hex, i) => (
                          <span
                            key={i}
                            className="h-2.5 w-2.5 rounded-full border border-white/25"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>

                      {isSelected && (
                        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow">
                          <Check className="h-3 w-3" aria-hidden />
                          Tanlangan
                        </span>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-heading text-sm font-bold text-text truncate">
                            {style.name}
                          </h3>
                        </div>
                        <span className="inline-block text-[10px] font-semibold text-accent-cyan">
                          {style.tag}
                        </span>
                        <p className="mt-1.5 text-[11px] text-muted leading-relaxed line-clamp-3">
                          {style.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. G'oya & Trend Lab */}
          <section className="card p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-violet-300 border border-primary/40 text-xs font-bold">
                  02
                </span>
                <h2 className="font-heading text-base font-bold text-text">
                  Video G&apos;oyasi yoki Mavzusi
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handleSuggestIdeas()}
                disabled={suggesting || loading}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <Wand2 className={`h-3.5 w-3.5 ${suggesting ? "animate-spin" : ""}`} aria-hidden />
                {suggesting ? "G'oyalar qidirilmoqda..." : `${activeStyle.name} g'oyalari`}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {NISHE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    handleSuggestIdeas(cat.query);
                  }}
                  className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 border ${
                    selectedCategory === cat.id
                      ? "border-primary/60 bg-primary text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)]"
                      : "border-border bg-surface-2/70 text-muted hover:text-text hover:border-primary/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`Masalan (${activeStyle.name}): Agar odam 3 daqiqa nafasini ushlab tursa tanada nima sodir bo'ladi?`}
                rows={3}
                disabled={loading}
                className="w-full rounded-2xl border border-border bg-background/80 px-4 py-3.5 text-sm text-text placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition resize-none leading-relaxed"
              />
              <div className="nums font-mono absolute right-3.5 bottom-3 text-[11px] text-muted">
                {topic.length} belgi
              </div>
            </div>

            {suggestedIdeas.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-warning" aria-hidden />
                  {activeStyle.name} uslubiga mos g&apos;oyalar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestedIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(idea)}
                      className="group cursor-pointer flex items-start gap-2.5 rounded-2xl border border-border bg-surface-2/70 p-3 text-left text-xs text-text hover:border-primary/60 hover:bg-surface-2 transition-all duration-200"
                    >
                      <span className="font-mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-[10px] font-bold text-violet-300 group-hover:bg-primary group-hover:text-white transition-colors">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2 leading-snug">{idea}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 3. Ssenariy Yozuvchi AI Dvigateli */}
          <section className="card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-violet-300 border border-primary/40 text-xs font-bold">
                03
              </span>
              <h2 className="font-heading text-base font-bold text-text">
                Ssenariy Dvigateli (AI Engine)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setAiProvider("groq")}
                className={`relative flex cursor-pointer flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                  aiProvider === "groq"
                    ? "border-primary bg-primary/15 ring-1 ring-primary/50 shadow-[0_0_24px_rgba(124,58,237,0.2)]"
                    : "border-border bg-surface-2/60 hover:border-primary/35 hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2 gap-2">
                  <span className="flex items-center gap-1.5 font-heading text-sm font-bold text-text">
                    <Zap className="h-4 w-4 text-accent-cyan" aria-hidden />
                    Groq AI (Avto-Model)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-success/15 text-emerald-300 border border-success/30">
                    ~1.2s Tez
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Viral hooklar va dinamik qisqa ssenariylar uchun tavsiya etiladi.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider("gemini")}
                className={`relative flex cursor-pointer flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                  aiProvider === "gemini"
                    ? "border-primary bg-primary/15 ring-1 ring-primary/50 shadow-[0_0_24px_rgba(124,58,237,0.2)]"
                    : "border-border bg-surface-2/60 hover:border-primary/35 hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2 gap-2">
                  <span className="flex items-center gap-1.5 font-heading text-sm font-bold text-text">
                    <Brain className="h-4 w-4 text-violet-300" aria-hidden />
                    Gemini 2.0 Flash
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-violet-300 border border-primary/30">
                    Chuqur Mantiq
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Boy faktlar, ta&apos;limiy va chuqur tahliliy videolar uchun a&apos;lo.
                </p>
              </button>
            </div>
          </section>

          {/* 4. Ovoz Studiyasi & Hook */}
          <section className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-violet-300 border border-primary/40 text-xs font-bold">
                  04
                </span>
                <h2 className="font-heading text-base font-bold text-text">
                  Ovoz Studiyasi (Gemini TTS) va Hook
                </h2>
              </div>
              <span className="text-xs font-semibold text-accent-cyan">
                Tabiiy o&apos;zbekcha nutq
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {VOICES.map((v) => {
                const isSelected = voiceId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVoiceId(v.id);
                      setVoiceManuallyChanged(true);
                    }}
                    className={`flex cursor-pointer items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/15 ring-1 ring-primary/50 shadow-[0_0_24px_rgba(124,58,237,0.2)]"
                        : "border-border bg-surface-2/60 hover:border-primary/35 hover:bg-surface-2"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isSelected
                          ? "gradient-brand text-white shadow-md"
                          : "bg-surface text-muted border border-border"
                      }`}
                    >
                      {isSelected ? (
                        <div className="flex items-end gap-0.5 h-4 px-0.5" aria-label="Faol ovoz to'lqini">
                          <span className="w-1 bg-white rounded-full eq-bar-1" />
                          <span className="w-1 bg-white rounded-full eq-bar-2" />
                          <span className="w-1 bg-white rounded-full eq-bar-3" />
                          <span className="w-1 bg-white rounded-full eq-bar-4" />
                        </div>
                      ) : (
                        <Volume2 className="h-4 w-4" aria-hidden />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading text-sm font-bold text-text">{v.name}</span>
                        <span className="text-[10px] text-muted font-semibold px-2 py-0.5 rounded-full bg-surface border border-border">
                          {v.gender}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-accent-cyan leading-tight mt-1">
                        {v.tone}
                      </p>
                      <p className="text-[11px] text-muted mt-1 leading-snug">{v.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1.5">
                  Hook (Birinchi 2 soniya) uslubi
                </label>
                <select
                  value={hookStyle}
                  onChange={(e) => setHookStyle(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs font-medium text-text focus:border-primary focus:outline-none"
                >
                  <option value="Savol & Qiziqish">Savol &amp; Qiziqish (Miyani uyg&apos;otuvchi)</option>
                  <option value="Kutilmagan Shok Fakt">Kutilmagan Shok Fakt</option>
                  <option value="Muammo & Yechim">Muammo va Aniq Yechim</option>
                  <option value="To'g'ridan-to'g'ri chaqiriq">To&apos;g&apos;ridan-to&apos;g&apos;ri chaqiriq</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1.5">
                  Format &amp; O&apos;lcham
                </label>
                <div className="rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs font-medium text-text flex items-center justify-between">
                  <span>9:16 Vertikal (Full HD)</span>
                  <span className="font-mono text-xs text-accent-cyan font-bold">1080×1920</span>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-xs font-medium text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-danger" aria-hidden />
              <p>{error}</p>
            </div>
          )}

          {/* KATTA ASOSIY ISHGA TUSHIRISH TUGMASI */}
          <Button
            type="button"
            variant="gradient"
            onClick={() => handleGenerate()}
            disabled={loading || !topic.trim()}
            className="w-full h-14 text-base font-bold gap-3 rounded-2xl neon-glow"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {activeStyle.name} uslubida yaratilmoqda... ({elapsedSec}s)
              </>
            ) : (
              <>
                <Clapperboard className="h-5 w-5" aria-hidden />
                {activeStyle.name} Uslubida Video Yaratish
              </>
            )}
          </Button>
        </div>

        {/* O'NG USTUN: SMARTFON ROMIDAGI JONLI CANVA VA PLEYER (lg:col-span-5) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-accent-cyan" aria-hidden />
              Jonli 9:16 Canvas ({activeStyle.name})
            </span>
            {result?.videoUrl && (
              <Badge tone="success" className="gap-1 text-[11px]">
                <Check className="h-3 w-3" aria-hidden />
                Tayyor
              </Badge>
            )}
          </div>

          <div className="mx-auto w-full max-w-[340px] rounded-[3rem] p-3.5 bg-gradient-to-b from-surface-2 to-background border border-white/15 shadow-2xl neon-glow">
            <div className="mx-auto mb-3 h-4 w-28 rounded-full bg-background border border-border flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-surface-2 mr-2" />
              <div className="h-1.5 w-8 rounded-full bg-surface-2" />
            </div>

            <div className="relative aspect-[9/16] w-full rounded-[2.2rem] overflow-hidden bg-black border border-border flex flex-col justify-between p-4">
              {/* 1. Natija holati */}
              {result && result.videoUrl ? (
                <div className="absolute inset-0 z-10 flex flex-col justify-between bg-black">
                  <video
                    src={result.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <Badge tone="success" className="text-[10px] bg-black/70 backdrop-blur-md">
                      1080×1920 Full HD
                    </Badge>
                  </div>
                </div>
              ) : null}

              {/* 2. Loading holati */}
              {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-background/95 backdrop-blur-md text-center space-y-5">
                  <div className="relative flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-accent-cyan animate-spin" />
                    <Film className="h-7 w-7 text-violet-300 absolute animate-pulse" aria-hidden />
                  </div>

                  <div className="space-y-1">
                    <p className="font-heading text-sm font-bold text-text">
                      {activeStyle.name} Renderi
                    </p>
                    <p className="nums font-mono text-xs text-accent-cyan font-semibold flex items-center justify-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {elapsedSec} soniya
                    </p>
                  </div>

                  <div className="w-full space-y-2 text-left pt-2 text-[11px]">
                    {stageItems.map((item) => {
                      const active = progressStage >= item.step;
                      return (
                        <div
                          key={item.step}
                          className={`flex items-center gap-2 rounded-xl p-2 transition-all duration-200 ${
                            active
                              ? "bg-primary/20 text-text font-semibold border border-primary/30"
                              : "text-muted opacity-45"
                          }`}
                        >
                          <CheckCircle2
                            className={`h-3.5 w-3.5 shrink-0 ${
                              active ? "text-accent-cyan" : "text-muted"
                            }`}
                            aria-hidden
                          />
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Kutish (Standby) holati: tanlangan animatsiya uslubi previewi */}
              {!result && !loading && (
                <div className="relative flex h-full flex-col justify-between py-5 px-2 text-center text-muted">
                  <img
                    src={activeStyle.previewImage}
                    alt={activeStyle.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-25 blur-[2px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/90" />

                  <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-white/80">
                    <span>{activeStyle.renderConfig.headerLabel}</span>
                    <span>1080 × 1920</span>
                  </div>

                  <div className="relative z-10 space-y-3 my-auto">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/70 border border-white/15 text-accent-cyan shadow-xl backdrop-blur">
                      <Play className="h-6 w-6 ml-0.5" aria-hidden />
                    </div>
                    <div className="space-y-1.5 px-2">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-white/15 bg-black/60 text-white"
                      >
                        {activeStyle.tag}
                      </span>
                      <p className="font-heading text-sm font-bold text-white">
                        {activeStyle.name}
                      </p>
                      <p className="text-[11px] text-white/75 leading-relaxed">
                        AI ushbu uslub qoidalarini o&apos;rganib, ssenariy va subtitrlarni moslashtiradi.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-black/70 backdrop-blur p-2.5 text-[10px] font-medium text-white/90">
                    <Rocket className="h-3 w-3 text-accent-cyan" aria-hidden />
                    <span>
                      {aiProvider === "groq" ? "Groq AI" : "Gemini AI"} + {voiceId} TTS
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/15" />
          </div>

          {/* Natija chiqqandan keyingi boshqaruv tugmalari */}
          {result && result.videoUrl && (
            <div className="space-y-3 pt-2">
              <a
                href={result.videoUrl}
                download={`${result.title || "video"}.mp4`}
                className="w-full h-12 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl gradient-brand text-white font-bold text-sm shadow-lg hover:brightness-110 transition neon-glow"
              >
                <Download className="h-4 w-4" aria-hidden />
                Videoni Yuklab Olish (MP4 1080p)
              </a>

              <div className="grid grid-cols-2 gap-2.5">
                {result.coverUrl && (
                  <a
                    href={result.coverUrl}
                    download="cover.jpg"
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-text hover:border-primary/50 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
                    Muqova (JPG)
                  </a>
                )}

                <button
                  type="button"
                  onClick={copyCaption}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-text hover:border-primary/50 transition"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                      Nusxalandi!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
                      Post Matnini Nusxalash
                    </>
                  )}
                </button>
              </div>

              {result.caption && (
                <div className="card p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-bold text-text text-sm">{result.title}</span>
                    <span className="nums font-mono text-[11px] text-accent-cyan flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden />
                      {result.durationSec}s
                    </span>
                  </div>
                  <p className="text-muted text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {result.caption}
                  </p>
                  {result.hashtags && result.hashtags.length > 0 && (
                    <p className="text-violet-300 font-semibold text-xs pt-1">
                      {result.hashtags.join(" ")}
                    </p>
                  )}
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={resetStudio}
                className="w-full gap-1.5 rounded-xl"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Yangi Video Yasash
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Style Sheet Preview Modal */}
      {previewStyleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewStyleModal(null)}
        >
          <div
            className="glass-panel w-full max-w-2xl rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-text">
                    {previewStyleModal.name}
                  </h3>
                  <Badge tone="primary" className="text-[10px]">
                    {previewStyleModal.tag}
                  </Badge>
                </div>
                <p className="text-xs text-muted mt-1">{previewStyleModal.bestFor}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewStyleModal(null)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-surface-2 text-muted hover:text-text"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-black">
              <img
                src={previewStyleModal.previewImage}
                alt={previewStyleModal.name}
                className="w-full max-h-[60vh] object-contain mx-auto"
              />
            </div>

            <p className="text-xs text-muted leading-relaxed">{previewStyleModal.summary}</p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewStyleModal(null)}
              >
                Yopish
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  handleSelectStyle(previewStyleModal);
                  setPreviewStyleModal(null);
                }}
              >
                <Check className="h-3.5 w-3.5" aria-hidden />
                Shu uslubni tanlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
