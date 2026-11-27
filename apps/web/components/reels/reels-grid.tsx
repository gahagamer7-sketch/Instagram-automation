"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clapperboard,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  FileText,
  Volume2,
  Download,
  Play,
  Copy,
  Check,
  X,
  Film,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format";

export interface ReelCardItem {
  id: string;
  topic: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  durationSec: number | null;
  caption: string | null;
  hashtags: string[];
  qaPassed: boolean;
  qaScore?: number;
  fileUrl: string | null;
  coverUrl: string | null;
  scriptText?: string | null;
}

export function ReelsGrid({ items = [] }: { items: ReelCardItem[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReel, setSelectedReel] = useState<ReelCardItem | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const filtered = items.filter((item) => {
    // Holat bo'yicha filter
    if (filter !== "all" && item.status !== filter) return false;

    // Qidiruv bo'yicha filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = item.topic.toLowerCase().includes(q);
      const matchCaption = (item.caption || "").toLowerCase().includes(q);
      return matchTopic || matchCaption;
    }

    return true;
  });

  function copyCaption(reel: ReelCardItem) {
    if (!reel.caption) return;
    const text = `${reel.caption}\n\n${(reel.hashtags || []).join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Yuqori Qidiruv va Filtr Paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-border/80">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "Barchasi", count: items.length },
            { id: "ready", label: "Tayyor (MP4)", count: items.filter((i) => i.status === "ready").length },
            { id: "script", label: "Ssenariyda", count: items.filter((i) => i.status === "script").length },
            { id: "published", label: "Joylangan", count: items.filter((i) => i.status === "published").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "border border-border bg-surface text-muted hover:text-text hover:bg-surface-2"
              }`}
            >
              {tab.label} <span className="nums opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Qidiruv maydoni */}
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mavzu bo'yicha qidirish..."
              className="w-full rounded-xl border border-border bg-surface pl-8 pr-3 py-1.5 text-xs text-text placeholder-muted focus:border-primary focus:outline-none"
            />
          </div>

          <Link
            href="/reels/create"
            className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-95 transition shadow-sm shrink-0"
          >
            <Clapperboard className="h-3.5 w-3.5" />
            + Yangi Video
          </Link>
        </div>
      </div>

      {/* Grid: 9:16 Video Kartalari */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => {
            const isReady = item.status === "ready" || item.status === "published";
            return (
              <Card
                key={item.id}
                className="overflow-hidden flex flex-col group hover:border-primary/50 transition-all hover:shadow-xl glass-panel border-border/80 rounded-2xl"
              >
                {/* 9:16 Video Mockup / Cover Box */}
                <div className="relative aspect-[9/14] bg-surface-2 overflow-hidden flex flex-col justify-between p-4 border-b border-border/80">
                  {/* Agar muqova mavjud bo'lsa fonda ko'rsatish */}
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt={item.topic}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : null}

                  {/* Gradient qatlam */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 pointer-events-none" />

                  {/* Yuqori status badges */}
                  <div className="flex items-center justify-between gap-2 z-10">
                    <Badge
                      tone={
                        item.status === "published"
                          ? "success"
                          : item.status === "ready"
                            ? "primary"
                            : item.status === "script"
                              ? "warning"
                              : "neutral"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {item.status === "ready" ? "TAYYOR" : item.status.toUpperCase()}
                    </Badge>

                    {item.durationSec && (
                      <span className="nums flex items-center gap-1 text-[11px] font-semibold text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full border border-white/10">
                        <Clock className="h-3 w-3 text-primary" />
                        {item.durationSec}s
                      </span>
                    )}
                  </div>

                  {/* Markaziy Play/Preview tugmasi */}
                  <div className="my-auto text-center px-2 py-4 z-10 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedReel(item)}
                      className="w-12 h-12 rounded-full gradient-brand mx-auto flex items-center justify-center text-white mb-2 shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                      title="Videoni ko'rish"
                    >
                      <Play className="h-5 w-5 ml-0.5 fill-current" />
                    </button>
                    <h4 className="text-sm font-bold text-white line-clamp-3 leading-snug drop-shadow-md">
                      {item.topic}
                    </h4>
                  </div>

                  {/* Pastki metrika */}
                  <div className="text-[11px] text-white/80 z-10 flex items-center justify-between">
                    <span className="font-mono text-[10px]">1080×1920 HD</span>
                    {item.qaPassed && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        QA Tasdiqlangan
                      </span>
                    )}
                  </div>
                </div>

                {/* Karta osti ma'lumotlari */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-surface/90">
                  {item.caption ? (
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-muted italic">
                      Ssenariy va caption hali kiritilmagan.
                    </p>
                  )}

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedReel(item)}
                      className="text-xs gap-1.5 flex-1 rounded-xl"
                    >
                      {item.fileUrl ? (
                        <>
                          <Play className="h-3.5 w-3.5 text-primary" />
                          Ko&apos;rish
                        </>
                      ) : (
                        <>
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          Ssenariy
                        </>
                      )}
                    </Button>

                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        download={`${item.topic || "video"}.mp4`}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition shadow-2xs"
                        title="Videoni yuklab olish (MP4)"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Film}
          title="Videolar topilmadi"
          description={
            searchQuery
              ? `"${searchQuery}" bo'yicha hech qanday video topilmadi.`
              : "Hozircha birorta video ishlab chiqarilmagan. Katta Video Studiyada bir zumda yangi video yarating."
          }
          action={
            <Link
              href="/reels/create"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl gradient-brand px-5 py-2.5 text-sm font-bold text-white hover:opacity-95 transition shadow-lg"
            >
              <Clapperboard className="h-4 w-4" />
              + Yangi Video Yasash
            </Link>
          }
        />
      )}

      {/* Video Pleyer va Tafsilotlar Modali */}
      {selectedReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl glass-panel border-border/80 rounded-3xl">
            <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
              <div>
                <h3 className="font-bold text-text text-base leading-snug">
                  {selectedReel.topic}
                </h3>
                <span className="nums text-xs text-muted flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3 w-3" />
                  Davomiylik: ~{selectedReel.durationSec || 15} soniya (1080x1920 Full HD)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReel(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-2 text-muted hover:text-text hover:bg-surface transition"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video Player */}
            {selectedReel.fileUrl ? (
              <div className="flex flex-col items-center gap-3 py-2 border-b border-border/80">
                <div className="w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-primary/30 neon-glow">
                  <video
                    src={selectedReel.fileUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[260px]">
                  <a
                    href={selectedReel.fileUrl}
                    download={`${selectedReel.topic || "video"}.mp4`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-white shadow hover:bg-primary-strong transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    MP4 Yuklab Olish
                  </a>

                  {selectedReel.coverUrl && (
                    <a
                      href={selectedReel.coverUrl}
                      download="cover.jpg"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 transition"
                    >
                      Muqova (JPG)
                    </a>
                  )}
                </div>
              </div>
            ) : null}

            {/* Ovozli matn (Ssenariy) */}
            {selectedReel.scriptText && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" />
                  TTS Ovozli Ssenariy Matni
                </h5>
                <div className="p-3.5 rounded-2xl bg-surface-2 text-xs text-text leading-relaxed border border-border">
                  {selectedReel.scriptText}
                </div>
              </div>
            )}

            {/* Post Matni (Caption) */}
            {selectedReel.caption && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5" />
                    Ijtimoiy Tarmoqlar uchun Post Matni (Caption)
                  </h5>

                  <button
                    type="button"
                    onClick={() => copyCaption(selectedReel)}
                    className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
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

                <div className="p-3.5 rounded-2xl bg-surface-2 text-xs text-text border border-border whitespace-pre-wrap leading-relaxed">
                  {selectedReel.caption}
                  {selectedReel.hashtags && selectedReel.hashtags.length > 0 && (
                    <div className="mt-2 text-primary font-medium">
                      {selectedReel.hashtags.join(" ")}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedReel(null)}
                className="rounded-xl"
              >
                Yopish
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
