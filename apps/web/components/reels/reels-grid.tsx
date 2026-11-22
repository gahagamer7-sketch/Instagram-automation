"use client";

import Link from "next/link";
import {
  Clapperboard,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  AlertCircle,
  FileText,
  Volume2,
} from "lucide-react";
import { useState } from "react";
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
  const [selectedReel, setSelectedReel] = useState<ReelCardItem | null>(null);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Statistika va filtrlar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Barchasi", count: items.length },
            { id: "ready", label: "Tayyor", count: items.filter((i) => i.status === "ready").length },
            { id: "script", label: "Ssenariyda", count: items.filter((i) => i.status === "script").length },
            { id: "published", label: "Joylangan", count: items.filter((i) => i.status === "published").length },
            { id: "idea", label: "G'oyada", count: items.filter((i) => i.status === "idea").length },
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

        <Link
          href="/calendar"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-strong transition shadow-sm"
        >
          <Calendar className="h-3.5 w-3.5" />
          Kalendarga o'tish
        </Link>
      </div>

      {/* Grid: 9:16 Reels Kartalari */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            return (
              <Card
                key={item.id}
                className="overflow-hidden flex flex-col group hover:border-primary/50 transition-all hover:shadow-lg"
              >
                {/* 9:16 Video Mockup / Cover Box */}
                <div className="relative aspect-[9/14] bg-surface-2 overflow-hidden flex flex-col justify-between p-4 border-b border-border">
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
                    >
                      {item.status.toUpperCase()}
                    </Badge>

                    {item.qaPassed && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-success bg-surface/80 backdrop-blur px-2 py-0.5 rounded-full border border-success/30">
                        <CheckCircle2 className="h-3 w-3" />
                        QA OK
                      </span>
                    )}
                  </div>

                  {/* Markaziy mavzu preview */}
                  <div className="my-auto text-center px-2 py-4">
                    <div className="w-10 h-10 rounded-full gradient-brand mx-auto flex items-center justify-center text-white mb-2 shadow-md">
                      <Clapperboard className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-text line-clamp-3 leading-snug">
                      {item.topic}
                    </h4>
                    {item.durationSec && (
                      <span className="nums inline-block text-[11px] text-muted font-medium mt-1">
                        ~{item.durationSec} soniya (9:16)
                      </span>
                    )}
                  </div>

                  {/* Pastki metrika */}
                  <div className="text-[11px] text-muted z-10">
                    {item.scheduledFor ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(item.scheduledFor)}
                      </div>
                    ) : (
                      "Jadvalda yo'q"
                    )}
                  </div>
                </div>

                {/* Karta osti ma'lumotlari */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 bg-surface">
                  {item.caption ? (
                    <p className="text-xs text-muted line-clamp-2">
                      {item.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-muted italic">
                      Ssenariy va caption hali yozilmagan.
                    </p>
                  )}

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    {item.scriptText ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedReel(item)}
                        className="w-full text-xs gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Ssenariyni o'qish
                      </Button>
                    ) : (
                      <Link
                        href="/calendar"
                        className="w-full text-center text-xs font-semibold text-primary py-1.5 hover:underline"
                      >
                        Kalendarda yozish →
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Clapperboard}
          title="Reels kutubxonasi bo'sh"
          description="Hozircha birorta Reels yaratilmagan. Kontent kalendaridan yangi g'oyalar va ssenariylar yarating."
          action={
            <Link
              href="/calendar"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong transition shadow"
            >
              <Calendar className="h-4 w-4" />
              Kontent kalendariga o'tish
            </Link>
          }
        />
      )}

      {/* Ssenariy Modali / Tafsilotlar paneli */}
      {selectedReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-text text-base">
                  {selectedReel.topic}
                </h3>
                <span className="nums text-xs text-muted">
                  Davomiylik: ~{selectedReel.durationSec}s
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedReel(null)}
              >
                ✕
              </Button>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5" />
                TTS Ovozli matn (O'zbekcha)
              </h5>
              <div className="p-3.5 rounded-xl bg-surface-2 text-xs text-text leading-relaxed border border-border">
                {selectedReel.scriptText}
              </div>
            </div>

            {selectedReel.caption && (
              <div>
                <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" />
                  Instagram Post Matni (Caption)
                </h5>
                <div className="p-3.5 rounded-xl bg-surface-2 text-xs text-text border border-border whitespace-pre-wrap">
                  {selectedReel.caption}
                  <div className="mt-2 text-primary font-medium">
                    {selectedReel.hashtags.join(" ")}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedReel(null)}>
                Yopish
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
