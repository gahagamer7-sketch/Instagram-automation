"use client";

import { useState } from "react";
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
  FileVideo,
  Play,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createVideoAction, suggestIdeasAction, type CreateVideoResponse } from "@/app/reels/actions";

interface VideoCreatorStudioProps {
  initialActiveSkill?: string;
  defaultNiche?: string;
}

export function VideoCreatorStudio({
  initialActiveSkill = "",
  defaultNiche = "Foydali Ma'lumotlar",
}: VideoCreatorStudioProps) {
  const [topic, setTopic] = useState("");
  const [aiProvider, setAiProvider] = useState<"groq" | "gemini">("groq");
  const [voiceId, setVoiceId] = useState("Puck");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSkill, setCustomSkill] = useState(initialActiveSkill);

  // G'oyalar taklif qilish holati
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedIdeas, setSuggestedIdeas] = useState<string[]>([]);

  // Video yaratish holati
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateVideoResponse | null>(null);

  // Nusxalash holati
  const [copiedCaption, setCopiedCaption] = useState(false);

  async function handleSuggestIdeas() {
    setSuggesting(true);
    try {
      const res = await suggestIdeasAction(defaultNiche, aiProvider);
      if (res.ok && res.ideas.length > 0) {
        setSuggestedIdeas(res.ideas);
      }
    } finally {
      setSuggesting(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Animatsiya uchun qadamlar
    setLoadingStep("1/3 Ssenariy yozilmoqda (" + (aiProvider === "groq" ? "Groq Llama 3.3" : "Gemini 2.0") + ")...");

    const timer1 = setTimeout(() => {
      setLoadingStep("2/3 O'zbekcha tabiiy ovoz yozilmoqda (Gemini TTS)...");
    }, 4000);

    const timer2 = setTimeout(() => {
      setLoadingStep("3/3 FFmpeg montaj va 1080x1920 video render qilinmoqda...");
    }, 9000);

    try {
      const res = await createVideoAction({
        topic: topic.trim(),
        aiProvider,
        voiceId,
        customSkillText: customSkill.trim() || undefined,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        setError(res.message || "Video yaratishda xatolik yuz berdi.");
      } else {
        setResult(res);
      }
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setError(err instanceof Error ? err.message : "Video yaratishda xato.");
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

  return (
    <div className="space-y-6">
      {/* Natija ko'rsatish bloki (agar video tayyor bo'lsa) */}
      {result && result.videoUrl ? (
        <Card className="p-6 border-success/40 bg-surface shadow-xl">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-success animate-ping" />
              <h3 className="text-lg font-bold text-text">
                🎉 Videongiz muvaffaqiyatli tayyorlandi!
              </h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setResult(null);
                setTopic("");
              }}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Yangi video yasash
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* 9:16 Video Player */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl border border-border">
                <video
                  src={result.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 flex flex-col w-full max-w-[280px] gap-2">
                <a
                  href={result.videoUrl}
                  download={`${result.title || "reels"}.mp4`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-strong transition"
                >
                  <Download className="h-4 w-4" />
                  Videoni yuklab olish (MP4)
                </a>

                {result.coverUrl && (
                  <a
                    href={result.coverUrl}
                    download="cover.jpg"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted hover:text-text hover:bg-surface transition"
                  >
                    Muqovani yuklab olish (JPG)
                  </a>
                )}
              </div>
            </div>

            {/* Video ma'lumotlari va nusxalash */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Sarlavha
                </span>
                <h4 className="text-base font-bold text-text mt-0.5">
                  {result.title}
                </h4>
                {result.durationSec && (
                  <span className="text-xs text-muted inline-block mt-1">
                    ⏱️ Davomiylik: {result.durationSec} soniya (1080x1920 Full HD)
                  </span>
                )}
              </div>

              {result.caption && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Ijtimoiy tarmoqlar uchun post matni (Caption)
                    </span>
                    <button
                      onClick={copyCaption}
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                    >
                      {copiedCaption ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-success" />
                          Nusxalandi!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Nusxalash
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-2 text-xs text-text border border-border whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {result.caption}
                    {result.hashtags && result.hashtags.length > 0 && (
                      <div className="mt-3 text-primary font-medium">
                        {result.hashtags.join(" ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface-2 p-3.5 text-xs text-muted">
                💡 <b>Maslahat:</b> Videoni MP4 formatida yuklab oling va yuqoridagi matn bilan birga Instagram Reels, TikTok yoki YouTube Shorts&apos;ga joylang!
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Asosiy Video Yaratish Formasi */}
      <Card className="p-6 shadow-md border-border">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">
                  Video Yaratish Studiyasi
                </h3>
                <p className="text-xs text-muted">
                  G&apos;oya va Skill asosida 1080x1920 formatdagi to&apos;liq video yarating.
                </p>
              </div>
            </div>

            <Badge tone="primary" className="gap-1 py-1 px-2.5">
              <Zap className="h-3 w-3 fill-current" />
              100% Avtomatlashgan
            </Badge>
          </div>

          {/* G'oya / Mavzu maydoni */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text uppercase tracking-wider">
                Video G&apos;oyasi yoki Mavzusi
              </label>

              <button
                type="button"
                onClick={handleSuggestIdeas}
                disabled={suggesting || loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-strong transition disabled:opacity-50"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                {suggesting ? "G'oyalar izlanmoqda..." : "AI G'oya taklif qil"}
              </button>
            </div>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: Har kuni ertalab 15 daqiqa kitob o'qishning miyaga 3 ta foydasi..."
              rows={3}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              required
            />

            {/* Taklif qilingan g'oyalar chiplari */}
            {suggestedIdeas.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] font-medium text-muted">
                  Taklif qilingan g&apos;oyalardan birini tanlang:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(idea)}
                      className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs text-text hover:border-primary/60 hover:bg-surface transition text-left"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Parametrlar qatori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* AI Ssenariy Dvigateli */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                Ssenariy yozuvchi AI
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiProvider("groq")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    aiProvider === "groq"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-surface text-muted hover:bg-surface-2"
                  }`}
                >
                  <Zap className="h-4 w-4 fill-current text-primary" />
                  Groq (Llama 3.3)
                </button>

                <button
                  type="button"
                  onClick={() => setAiProvider("gemini")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    aiProvider === "gemini"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-surface text-muted hover:bg-surface-2"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Gemini 2.0
                </button>
              </div>
            </div>

            {/* Ovoz tanlovi (Gemini TTS) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted flex items-center justify-between">
                <span>Ovoz (Gemini TTS)</span>
                <span className="text-[10px] text-primary">Tabiiy o&apos;zbekcha nutq</span>
              </label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text focus:border-primary focus:outline-none"
              >
                <option value="Puck">Puck — Erkak ovozi (Tiniq va ishonchli)</option>
                <option value="Kore">Kore — Ayol ovozi (Muloyim va aniq)</option>
                <option value="Fenrir">Fenrir — Erkak ovozi (Qat&apos;iy va chuqur)</option>
                <option value="Aoede">Aoede — Ayol ovozi (Ilhomlantiruvchi)</option>
              </select>
            </div>
          </div>

          {/* Qo'shimcha Skill (Uslub) sozlamalari */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-text transition"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showAdvanced ? "Maxsus Skill ko'rsatmasini yashirish" : "Maxsus Skill (Uslub) qoidasini kiritish"}
            </button>

            {showAdvanced && (
              <div className="mt-2.5 space-y-1.5">
                <span className="text-[11px] text-muted">
                  Ushbu ko&apos;rsatma AI qanday so&apos;zlashishi, hook qanday bo&apos;lishi va Reels qoidalarini belgilaydi:
                </span>
                <textarea
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Masalan: Qisqa, baquvvat gapir. Kirish qismida hayratlanarli fakt keltir..."
                  rows={4}
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-surface-2 p-3 text-xs text-text placeholder-muted focus:border-primary focus:outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Xatolik xabari */}
          {error && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs text-error">
              ⚠️ {error}
            </div>
          )}

          {/* Jarayon ko'rsatkichi */}
          {loading && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center space-y-2">
              <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-primary border-t-transparent text-primary" />
              <p className="text-xs font-bold text-primary animate-pulse">
                {loadingStep || "Video ishlab chiqarilmoqda..."}
              </p>
              <p className="text-[11px] text-muted">
                Odatda bu 15-25 soniya davom etadi. Iltimos kuting...
              </p>
            </div>
          )}

          {/* Asosiy tugma */}
          <Button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full h-11 text-sm font-bold gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Video yaratilmoqda...
              </>
            ) : (
              <>
                <Clapperboard className="h-4 w-4" />
                Video Yasash (1080x1920 Full HD)
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

