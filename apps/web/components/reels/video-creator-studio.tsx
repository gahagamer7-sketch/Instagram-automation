"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Clapperboard,
  Zap,
  Volume2,
  Download,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Lightbulb,
  Play,
  Film,
  Smartphone,
  Wand2,
  Layers,
  Settings2,
  Share2,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createVideoAction,
  suggestIdeasAction,
  type CreateVideoResponse,
} from "@/app/reels/actions";

interface VideoCreatorStudioProps {
  initialActiveSkill?: string;
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
    desc: "Biznes, yangiliklar va ta'limiy mavzular uchun ideal.",
  },
  {
    id: "Kore",
    name: "Kore",
    gender: "Ayol",
    tone: "Muloyim, jozibali va ravon",
    desc: "Layfxaklar, psixologiya va qiziqarli hikoyalarga mos.",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Erkak",
    tone: "Qat'iy, chuqur va baquvvat",
    desc: "Motivatsiya, shok faktlar va hayratlanarli sirlar uchun.",
  },
  {
    id: "Aoede",
    name: "Aoede",
    gender: "Ayol",
    tone: "Jo'shqin, yorqin va ilhomlantiruvchi",
    desc: "Ijobiy kayfiyat, sayohat va trend reelslar uchun.",
  },
];

export function VideoCreatorStudio({
  initialActiveSkill = "",
  defaultNiche = "Foydali Ma'lumotlar",
}: VideoCreatorStudioProps) {
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(NISHE_CATEGORIES[0].id);
  const [aiProvider, setAiProvider] = useState<"groq" | "gemini">("groq");
  const [voiceId, setVoiceId] = useState("Puck");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSkill, setCustomSkill] = useState(initialActiveSkill);
  const [hookStyle, setHookStyle] = useState("Savol & Qiziqish");

  // G'oyalar holati
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([]);

  // Video yaratish jarayoni
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState(1);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateVideoResponse | null>(null);

  // Nusxalash holati
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Vaqt hisoblagich (generatsiya vaqtida)
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

  async function handleSuggestIdeas(categoryQuery?: string) {
    setSuggesting(true);
    const nicheTarget = categoryQuery || defaultNiche;
    try {
      const res = await suggestIdeasAction(nicheTarget, aiProvider);
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

    // Realistik ko'p bosqichli jarayon ko'rsatkichi
    const t1 = setTimeout(() => setProgressStage(2), 2500); // TTS ovoz sintezi
    const t2 = setTimeout(() => setProgressStage(3), 5500); // Fon media tanlovi
    const t3 = setTimeout(() => setProgressStage(4), 9000); // Karaoke subtitrlar
    const t4 = setTimeout(() => setProgressStage(5), 13000); // 1080x1920 render

    try {
      // Rejissyor uslubi bilan skillni boyitish
      const fullSkill = [
        customSkill.trim(),
        `Hook uslubi: ${hookStyle}.`,
        "Format: 1080x1920 vertikal qisqa video. Kirish qismi birinchi 2 soniyada diqqatni jalb qilsin.",
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await createVideoAction({
        topic: topic.trim(),
        aiProvider,
        voiceId,
        customSkillText: fullSkill || undefined,
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

  return (
    <div className="space-y-6">
      {/* Studiya Yuqori Sarlavha Paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-brand text-white shadow-md">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  Katta Video Studiya
                </h2>
                <Badge tone="primary" className="gap-1 py-0.5 px-2 text-[10px]">
                  <Sparkles className="h-3 w-3 fill-current" />
                  Pro Workstation
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                G&apos;oya va Rejissyor uslubi asosida 1080x1920 Full HD vertikal video ishlab chiqarish.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="success" className="gap-1.5 py-1 px-2.5 text-xs">
            <Radio className="h-3 w-3 animate-pulse text-success" />
            Dual-AI Engine Tayyor
          </Badge>
        </div>
      </div>

      {/* 2 USTUNLI ASOSIY ISH STANSIYASI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CHAP USTUN: KREATIV BOSHQARUV MARKAZI (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. G'oya & Trend Lab */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-[#111b2e] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-extrabold">
                  1
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Video G&apos;oyasi yoki Mavzusi
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleSuggestIdeas()}
                disabled={suggesting || loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-strong transition disabled:opacity-50"
              >
                <Wand2 className={`h-4 w-4 ${suggesting ? "animate-spin" : ""}`} />
                {suggesting ? "AI G'oyalar qidirilmoqda..." : "AI Trend G'oyalar"}
              </button>
            </div>

            {/* Nisha toifalari */}
            <div className="flex flex-wrap gap-2 pt-1">
              {NISHE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    handleSuggestIdeas(cat.query);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? "border border-primary bg-primary text-white font-bold shadow-md shadow-primary/20"
                      : "border border-slate-700/80 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Asosiy Mavzu Textarea */}
            <div className="relative">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: Har kuni ertalab 15 daqiqa kitob o'qish miyaga qanday ta'sir qiladi va uning 3 ta muhim siri..."
                rows={3}
                disabled={loading}
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3.5 text-sm text-white placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none leading-relaxed shadow-inner"
              />
              <div className="absolute right-3.5 bottom-3.5 text-xs text-slate-400 font-mono">
                {topic.length} belgi
              </div>
            </div>

            {/* AI Taklif qilgan g'oyalar ro'yxati */}
            {suggestedIdeas.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-warning" />
                  Quyidagi trend g&apos;oyalardan birini tanlang:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestedIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(idea)}
                      className="group flex items-start gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-3 text-left text-xs text-slate-200 hover:border-primary hover:bg-slate-800 transition shadow-sm cursor-pointer"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2 leading-snug">{idea}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Ssenariy Yozuvchi AI Dvigateli (Groq vs Gemini) */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-[#111b2e] shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-extrabold">
                2
              </span>
              <h3 className="text-base font-extrabold text-white">
                Ssenariy Dvigateli (AI Engine)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Groq Llama 3.3 */}
              <button
                type="button"
                onClick={() => setAiProvider("groq")}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition cursor-pointer ${
                  aiProvider === "groq"
                    ? "border-primary bg-primary/15 ring-2 ring-primary/40 shadow-lg text-white"
                    : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Zap className="h-4 w-4 fill-current text-primary" />
                    Groq (Llama 3.3 70B)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ⚡ ~1.2s Ultra-Tez
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Viral hooklar va dinamik qisqa ssenariylar uchun tavsiya etiladi.
                </p>
                {aiProvider === "groq" && (
                  <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-primary animate-ping" />
                )}
              </button>

              {/* Gemini 2.0 Flash */}
              <button
                type="button"
                onClick={() => setAiProvider("gemini")}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition cursor-pointer ${
                  aiProvider === "gemini"
                    ? "border-primary bg-primary/15 ring-2 ring-primary/40 shadow-lg text-white"
                    : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Gemini 2.0 Flash
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    🧠 Chuqur Mantiq
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Boy faktlar, ta&apos;limiy va chuqur tahliliy videolar uchun a&apos;lo.
                </p>
                {aiProvider === "gemini" && (
                  <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-primary animate-ping" />
                )}
              </button>
            </div>
          </div>

          {/* 3. Ovoz Studiyasi (Voice Lab) */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-[#111b2e] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-extrabold">
                  3
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Ovoz Studiyasi (Gemini TTS)
                </h3>
              </div>
              <span className="text-xs font-bold text-primary">
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
                    onClick={() => setVoiceId(v.id)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/15 ring-2 ring-primary/40 shadow-lg text-white"
                        : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                        isSelected
                          ? "bg-primary text-white shadow-md"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isSelected ? (
                        <div className="flex items-end gap-0.5 h-4 px-0.5" title="Audio to'lqin">
                          <span className="w-1 bg-white rounded-full eq-bar-1" />
                          <span className="w-1 bg-white rounded-full eq-bar-2" />
                          <span className="w-1 bg-white rounded-full eq-bar-3" />
                          <span className="w-1 bg-white rounded-full eq-bar-4" />
                        </div>
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{v.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          {v.gender}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary leading-tight mt-1">
                        {v.tone}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {v.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Rejissyor Uslubi & Maxsus Skill (Director Mode) */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-[#111b2e] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-extrabold">
                  4
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Rejissyor Uslubi (Director Mode)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showAdvanced ? "Yashirish" : "Sozlash"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Hook (Birinchi 2 soniya) uslubi:
                </label>
                <select
                  value={hookStyle}
                  onChange={(e) => setHookStyle(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2.5 text-xs font-medium text-white focus:border-primary focus:outline-none"
                >
                  <option value="Savol & Qiziqish">❓ Savol & Qiziqish (Miyani uyg&apos;otuvchi)</option>
                  <option value="Kutilmagan Shok Fakt">⚡ Kutilmagan Shok Fakt</option>
                  <option value="Muammo & Yechim">🎯 Muammo va Aniq Yechim</option>
                  <option value="To'g'ridan-to'g'ri chaqiriq">🔥 To&apos;g&apos;ridan-to&apos;g&apos;ri chaqiriq</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Format & O&apos;lcham:
                </label>
                <div className="rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2.5 text-xs font-medium text-white flex items-center justify-between">
                  <span>9:16 Vertikal (Full HD)</span>
                  <span className="font-mono text-xs text-primary font-bold">1080×1920</span>
                </div>
              </div>
            </div>

            {/* Kengaytirilgan Skill Matni */}
            {showAdvanced && (
              <div className="pt-3 space-y-2 border-t border-slate-800 mt-2">
                <span className="text-xs text-slate-300 block font-medium">
                  Maxsus Mahorat (Skill) qoidasi:
                </span>
                <textarea
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Masalan: Gaplar qisqa va tezkor bo'lsin. Murakkab so'zlar ishlatilmasin..."
                  rows={3}
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-700/80 bg-slate-950 p-3.5 text-xs text-white placeholder-slate-400 focus:border-primary focus:outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Xatolik xabari */}
          {error && (
            <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-xs font-medium text-danger flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* KATTA ASOSIY ISHGA TUSHIRISH TUGMASI */}
          <Button
            type="button"
            onClick={() => handleGenerate()}
            disabled={loading || !topic.trim()}
            className="w-full h-14 text-base font-extrabold gap-3 shadow-xl rounded-2xl gradient-brand text-white hover:opacity-95 transition disabled:opacity-50 neon-glow cursor-pointer"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                Video Ishlab Chiqarilmoqda... ({elapsedSec}s)
              </>
            ) : (
              <>
                <Clapperboard className="h-5 w-5" />
                🎬 1080x1920 Video Ishlab Chiqarish
              </>
            )}
          </Button>
        </div>

        {/* O'NG USTUN: SMARTFON ROMIDAGI JONLI CANVA VA PLEYER (lg:col-span-5) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-primary" />
              Jonli 9:16 Canvas (Live Stage)
            </span>
            {result?.videoUrl && (
              <Badge tone="success" className="gap-1 text-[11px]">
                <Check className="h-3 w-3" />
                Tayyor
              </Badge>
            )}
          </div>

          {/* Haqiqiy Smartfon Mockup Romi */}
          <div className="mx-auto w-full max-w-[340px] rounded-[3rem] p-3.5 bg-gradient-to-b from-slate-800 to-slate-950 border-4 border-slate-700/80 shadow-2xl ring-1 ring-white/10 neon-glow">
            {/* Smartfon Dynamic Island / Dinamik karnay */}
            <div className="mx-auto mb-3 h-4 w-28 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-800 mr-2" />
              <div className="h-1.5 w-8 rounded-full bg-slate-800" />
            </div>

            {/* Smartfon Ekrani (9:16 nisbat) */}
            <div className="relative aspect-[9/16] w-full rounded-[2.2rem] overflow-hidden bg-black border border-slate-900 flex flex-col justify-between p-4">
              {/* 1. Natija holati: Video pleyer */}
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
                    <Badge tone="success" className="text-[10px] bg-black/60 backdrop-blur-md border-white/10">
                      1080×1920 Full HD
                    </Badge>
                  </div>
                </div>
              ) : null}

              {/* 2. Ishlab chiqarish (Loading) holati */}
              {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md text-center space-y-5">
                  <div className="relative flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Film className="h-8 w-8 text-primary absolute animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-white">
                      Video Ishlab Chiqarilmoqda
                    </p>
                    <p className="text-xs text-primary font-mono font-semibold">
                      ⏱️ {elapsedSec} soniya
                    </p>
                  </div>

                  {/* 5-bosqichli status ro'yxati */}
                  <div className="w-full space-y-2 text-left pt-2 text-[11px]">
                    <div
                      className={`flex items-center gap-2 rounded-xl p-2 transition ${
                        progressStage >= 1
                          ? "bg-primary/20 text-white font-semibold"
                          : "text-muted opacity-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          progressStage >= 1 ? "text-primary" : "text-muted"
                        }`}
                      />
                      <span>1. AI Ssenariy generatsiyasi ({aiProvider})</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-xl p-2 transition ${
                        progressStage >= 2
                          ? "bg-primary/20 text-white font-semibold"
                          : "text-muted opacity-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          progressStage >= 2 ? "text-primary" : "text-muted"
                        }`}
                      />
                      <span>2. Tabiiy ovoz (TTS) yozilmoqda</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-xl p-2 transition ${
                        progressStage >= 3
                          ? "bg-primary/20 text-white font-semibold"
                          : "text-muted opacity-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          progressStage >= 3 ? "text-primary" : "text-muted"
                        }`}
                      />
                      <span>3. Fon media tanlanmoqda</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-xl p-2 transition ${
                        progressStage >= 4
                          ? "bg-primary/20 text-white font-semibold"
                          : "text-muted opacity-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          progressStage >= 4 ? "text-primary" : "text-muted"
                        }`}
                      />
                      <span>4. Karaoke subtitrlar montaj qilinmoqda</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-xl p-2 transition ${
                        progressStage >= 5
                          ? "bg-primary/20 text-white font-semibold"
                          : "text-muted opacity-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          progressStage >= 5 ? "text-primary" : "text-muted"
                        }`}
                      />
                      <span>5. 1080x1920 Full HD render</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Kutish (Standby) holati */}
              {!result && !loading && (
                <div className="flex h-full flex-col justify-between py-6 px-2 text-center text-muted studio-grid-bg">
                  <div className="flex items-center justify-between text-[10px] text-muted/80">
                    <span>9:16 VERTICAL</span>
                    <span>1080 × 1920</span>
                  </div>

                  <div className="space-y-3 my-auto">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2/60 border border-border/80 text-muted shadow-inner">
                      <Play className="h-6 w-6 ml-0.5 opacity-60" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-text">
                        Katta Studiya Tayyor
                      </p>
                      <p className="text-[11px] text-muted leading-relaxed px-4">
                        Chap panelda mavzuni kiriting va video ishlab chiqarish tugmasini bosing.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-surface-2/40 p-2.5 text-[10px] text-muted">
                    🚀 Groq Llama 3.3 + Gemini TTS
                  </div>
                </div>
              )}
            </div>

            {/* Smartfon quyi chizig'i (Home bar) */}
            <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-slate-800" />
          </div>

          {/* Natija chiqqandan keyingi boshqaruv tugmalari */}
          {result && result.videoUrl && (
            <div className="space-y-3 pt-2">
              <a
                href={result.videoUrl}
                download={`${result.title || "reels"}.mp4`}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-strong transition neon-glow"
              >
                <Download className="h-4 w-4" />
                Videoni Yuklab Olish (MP4 1080p)
              </a>

              <div className="grid grid-cols-2 gap-2">
                {result.coverUrl && (
                  <a
                    href={result.coverUrl}
                    download="cover.jpg"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Muqova (JPG)
                  </a>
                )}

                <button
                  type="button"
                  onClick={copyCaption}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      Nusxalandi!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-primary" />
                      Post Matnini Nusxalash
                    </>
                  )}
                </button>
              </div>

              {/* Sarlavha va Caption oynasi */}
              {result.caption && (
                <div className="rounded-2xl border border-slate-800 bg-[#111b2e] p-4 text-xs space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{result.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ⏱️ {result.durationSec} soniya
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {result.caption}
                  </p>
                  {result.hashtags && result.hashtags.length > 0 && (
                    <p className="text-primary font-semibold text-xs pt-1">
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
                <RotateCcw className="h-3.5 w-3.5" />
                Yangi Video Yasash
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
