"use client";

import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Trash2,
  Play,
  Volume2,
  Share2,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
  generateCalendarIdeasAction,
  generateScriptForVideoAction,
  updateScheduleDateAction,
  deleteVideoAction,
} from "@/app/calendar/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format";

export interface VideoCalendarItem {
  id: string;
  status: string;
  topic: string;
  category?: string;
  scheduledFor: string | null;
  caption: string | null;
  hashtags: string[];
  durationSec: number | null;
  qaPassed: boolean;
  qaScore?: number;
  script?: {
    id: string;
    content: string;
    shotList: Array<{
      id: number;
      timeRange: string;
      type: "hook" | "body" | "cta";
      spokenText: string;
      screenText: string;
      visualDirection: string;
    }>;
  } | null;
}

export function CalendarView({
  videos = [],
  activeNiche,
}: {
  videos: VideoCalendarItem[];
  activeNiche: string;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isGeneratingIdeas, startGeneratingIdeas] = useTransition();
  const [loadingScriptId, setLoadingScriptId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  const filteredVideos = videos.filter((v) => {
    if (filter === "all") return true;
    return v.status === filter;
  });

  const handleGenerateIdeas = () => {
    setFeedback(null);
    startGeneratingIdeas(async () => {
      const res = await generateCalendarIdeasAction(15);
      setFeedback({ tone: res.ok ? "success" : "danger", message: res.message });
    });
  };

  const handleGenerateScript = async (videoId: string) => {
    setFeedback(null);
    setLoadingScriptId(videoId);
    try {
      const res = await generateScriptForVideoAction(videoId);
      setFeedback({ tone: res.ok ? "success" : "danger", message: res.message });
      if (res.ok) setExpandedId(videoId);
    } finally {
      setLoadingScriptId(null);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Ushbu videoni kalendardan o'chirmoqchimisiz?")) return;
    const res = await deleteVideoAction(videoId);
    setFeedback({ tone: res.ok ? "success" : "danger", message: res.message });
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div>
          <Alert tone={feedback.tone}>{feedback.message}</Alert>
        </div>
      )}

      {/* Yuqori boshqaruv paneli */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Reja nishasi:
              </span>
              <Badge tone="primary">{activeNiche}</Badge>
            </div>
            <p className="text-xs text-muted mt-1">
              Kunlik 1 ta Reels (19:00 UTC+5) jadval bo'yicha tayyorlanadi va joylanadi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="gradient"
              disabled={isGeneratingIdeas}
              onClick={handleGenerateIdeas}
              className="gap-2"
            >
              {isGeneratingIdeas ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGeneratingIdeas ? "Rejalashtirilmoqda..." : "Yangi 15 kunlik reja tuzish (AI)"}
            </Button>
          </div>
        </div>

        {/* Filtr tugmalari */}
        <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-border">
          {[
            { id: "all", label: "Barchasi", count: videos.length },
            { id: "idea", label: "G'oyalar", count: videos.filter((v) => v.status === "idea").length },
            { id: "script", label: "Ssenariy tayyor", count: videos.filter((v) => v.status === "script").length },
            { id: "ready", label: "Tayyor", count: videos.filter((v) => v.status === "ready").length },
            { id: "published", label: "Joylangan", count: videos.filter((v) => v.status === "published").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filter === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "border border-border bg-surface text-muted hover:text-text hover:bg-surface-2"
              }`}
            >
              {tab.label} <span className="nums opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Kalendar ro'yxati */}
      {filteredVideos.length > 0 ? (
        <div className="space-y-3">
          {filteredVideos.map((video, idx) => {
            const isExpanded = expandedId === video.id;
            const isGeneratingScript = loadingScriptId === video.id;

            return (
              <Card key={video.id} className="p-4 transition hover:border-primary/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-border bg-surface-2 text-center shrink-0">
                      <span className="nums text-xs text-muted font-medium">#{idx + 1}</span>
                      <CalendarDays className="h-4 w-4 text-primary mt-0.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-text text-base leading-snug">
                          {video.topic}
                        </h4>
                        <Badge
                          tone={
                            video.status === "published"
                              ? "success"
                              : video.status === "ready"
                                ? "primary"
                                : video.status === "script"
                                  ? "warning"
                                  : "neutral"
                          }
                        >
                          {video.status === "idea"
                            ? "G'oya"
                            : video.status === "script"
                              ? "Ssenariy yozilgan"
                              : video.status === "ready"
                                ? "Tayyor"
                                : video.status === "published"
                                  ? "Joylangan"
                                  : video.status}
                        </Badge>
                        {video.qaPassed && (
                          <Badge tone="success" className="gap-1 text-[11px]">
                            <CheckCircle2 className="h-3 w-3" />
                            QA o'tgan
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted" />
                          {video.scheduledFor ? formatDateTime(video.scheduledFor) : "Vaqti belgilanmagan"}
                        </span>
                        {video.durationSec && (
                          <span className="nums">Davomiylik: ~{video.durationSec}s</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {video.script ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setExpandedId(isExpanded ? null : video.id)}
                        className="gap-1 text-xs"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {isExpanded ? "Yopish" : "Ssenariyni ko'rish"}
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="gradient"
                        disabled={isGeneratingScript}
                        onClick={() => handleGenerateScript(video.id)}
                        className="gap-1 text-xs"
                      >
                        {isGeneratingScript ? (
                          <Clock className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        {isGeneratingScript ? "Yozilmoqda..." : "Ssenariy yaratish"}
                      </Button>
                    )}

                    <button
                      type="button"
                      title="O'chirish"
                      onClick={() => handleDelete(video.id)}
                      className="p-2 rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Ssenariy tafsilotlari (Akkordeon) */}
                {isExpanded && video.script && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 bg-surface-2/40 -mx-4 -mb-4 p-4 rounded-b-2xl">
                    <div>
                      <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Play className="h-3.5 w-3.5" />
                        Sahnalar ketma-ketligi (Shot List)
                      </h5>
                      <div className="space-y-2">
                        {video.script.shotList.map((cue) => (
                          <div
                            key={cue.id}
                            className="p-3 rounded-xl border border-border bg-surface flex flex-wrap gap-3 items-start justify-between text-xs"
                          >
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge tone={cue.type === "hook" ? "danger" : cue.type === "cta" ? "success" : "primary"}>
                                  {cue.type.toUpperCase()} ({cue.timeRange})
                                </Badge>
                                <span className="font-semibold text-text">{cue.screenText}</span>
                              </div>
                              <p className="text-text mt-1">
                                <span className="text-muted font-medium">Ovozli matn: </span>
                                {cue.spokenText}
                              </p>
                            </div>
                            <div className="text-muted text-[11px] max-w-xs bg-surface-2 p-2 rounded-lg">
                              <span className="font-semibold block text-text">Vizual yo'riqnoma:</span>
                              {cue.visualDirection}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* To'liq ovozli matn (TTS) */}
                    <div>
                      <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5" />
                        TTS ovoz matni (Gemini Ovoz)
                      </h5>
                      <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text leading-relaxed">
                        {video.script.content}
                      </div>
                    </div>

                    {/* Caption va hashtaglar */}
                    {video.caption && (
                      <div>
                        <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Share2 className="h-3.5 w-3.5" />
                          Instagram Caption va Hashtaglar
                        </h5>
                        <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text whitespace-pre-wrap">
                          {video.caption}
                          <div className="mt-2 text-primary font-medium">
                            {video.hashtags.join(" ")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Kalendar bo'sh"
          description="Hozircha rejalashtirilgan videolar yo'q. AI yordamida 15-30 kunlik avtomatik kontent rejasini tuzing."
          action={
            <Button
              variant="gradient"
              disabled={isGeneratingIdeas}
              onClick={handleGenerateIdeas}
              className="mt-4 gap-2"
            >
              {isGeneratingIdeas ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGeneratingIdeas ? "Rejalashtirilmoqda..." : "15 kunlik reja tuzish (AI)"}
            </Button>
          }
        />
      )}
    </div>
  );
}

