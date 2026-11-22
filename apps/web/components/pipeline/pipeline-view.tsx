"use client";

import {
  Workflow,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Volume2,
  Film,
  ShieldCheck,
  Share2,
  Lightbulb,
  Ban,
} from "lucide-react";
import { useState, useTransition } from "react";
import { retryJobAction, cancelJobAction } from "@/app/pipeline/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/format";

export interface PipelineStageCount {
  idea: number;
  script: number;
  voice: number;
  render: number;
  qa: number;
  ready: number;
  published: number;
  failed: number;
}

export interface PipelineJobItem {
  id: string;
  type: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  runAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface PipelineVideoItem {
  id: string;
  topic: string;
  status: string;
  durationSec: number | null;
  scheduledFor: string | null;
  updatedAt: string;
}

export function PipelineView({
  stageCounts,
  jobs = [],
  recentVideos = [],
  isPaused,
}: {
  stageCounts: PipelineStageCount;
  jobs: PipelineJobItem[];
  recentVideos: PipelineVideoItem[];
  isPaused: boolean;
}) {
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  const stages = [
    { key: "idea", label: "G'oya", icon: Lightbulb, count: stageCounts.idea },
    { key: "script", label: "Ssenariy", icon: FileText, count: stageCounts.script },
    { key: "voice", label: "Ovoz (TTS)", icon: Volume2, count: stageCounts.voice },
    { key: "render", label: "Render", icon: Film, count: stageCounts.render },
    { key: "qa", label: "QA Nazorati", icon: ShieldCheck, count: stageCounts.qa },
    { key: "ready", label: "Tayyor", icon: CheckCircle2, count: stageCounts.ready },
    { key: "published", label: "Joylangan", icon: Share2, count: stageCounts.published },
  ];

  const handleRetry = async (jobId: string) => {
    setLoadingJobId(jobId);
    try {
      const res = await retryJobAction(jobId);
      setFeedback({ tone: res.ok ? "success" : "danger", message: res.message });
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleCancel = async (jobId: string) => {
    setLoadingJobId(jobId);
    try {
      const res = await cancelJobAction(jobId);
      setFeedback({ tone: res.ok ? "success" : "danger", message: res.message });
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      {isPaused && (
        <Alert tone="warning">
          Tizim hozir to'xtatilgan (pauza). Yangi ishlab chiqarish va joylash cron'lari
          avtomatik ishga tushmaydi. Davom ettirish uchun yuqori paneldagi tugmadan foydalaning.
        </Alert>
      )}

      {feedback && (
        <div>
          <Alert tone={feedback.tone}>{feedback.message}</Alert>
        </div>
      )}

      {/* 1. Vizual Bosqichlar (Pipeline Flow) */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-text text-base flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              Reels Ishlab Chiqarish Bosqichlari
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Har bir Reels quyidagi 7 bosqichdan to'liq avtomatik o'tadi.
            </p>
          </div>
          {stageCounts.failed > 0 && (
            <Badge tone="danger">
              {stageCounts.failed} ta xato video
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {stages.map((st, i) => {
            const Icon = st.icon;
            const hasItems = st.count > 0;
            return (
              <div
                key={st.key}
                className={`relative p-3 rounded-2xl border transition ${
                  hasItems
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="nums text-[10px] text-muted font-bold">
                    0{i + 1}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      hasItems
                        ? "gradient-brand text-white shadow-sm"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="font-semibold text-text text-xs">{st.label}</div>
                <div className="nums text-lg font-bold text-text mt-0.5">
                  {st.count}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Oxirgi videolarning pipeline holati */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-text text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Oxirgi Reels harakatlari
          </h3>

          {recentVideos.length > 0 ? (
            <div className="space-y-2.5">
              {recentVideos.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl border border-border bg-surface flex items-start justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text truncate">{v.topic}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {v.scheduledFor ? formatDateTime(v.scheduledFor) : "Jadvalsiz"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      v.status === "published"
                        ? "success"
                        : v.status === "ready"
                          ? "primary"
                          : v.status === "script"
                            ? "warning"
                            : "neutral"
                    }
                  >
                    {v.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">Hozircha harakatdagi videolar yo'q.</p>
          )}
        </Card>

        {/* 3. Fon vazifalari (Jobs Queue) */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text text-sm flex items-center gap-2">
                <Workflow className="h-4 w-4 text-primary" />
                Vazifalar navbati (Jobs Queue)
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Vercel Cron va render worker uchun fon vazifalari.
              </p>
            </div>
          </div>

          {jobs.length > 0 ? (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-surface-2/40 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text">{job.type}</span>
                      <Badge
                        tone={
                          job.status === "done"
                            ? "success"
                            : job.status === "running"
                              ? "primary"
                              : job.status === "failed"
                                ? "danger"
                                : "neutral"
                        }
                      >
                        {job.status}
                      </Badge>
                      <span className="nums text-muted">
                        ({job.attempts}/{job.maxAttempts} urinish)
                      </span>
                    </div>

                    {job.error ? (
                      <p className="text-danger mt-1 text-[11px]">{job.error}</p>
                    ) : (
                      <p className="text-muted mt-0.5 text-[11px]">
                        Rejalashtirilgan vaqt: {formatDateTime(job.runAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {job.status === "failed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={loadingJobId === job.id}
                        onClick={() => handleRetry(job.id)}
                        className="gap-1 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Qayta urinish
                      </Button>
                    )}

                    {job.status === "pending" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={loadingJobId === job.id}
                        onClick={() => handleCancel(job.id)}
                        className="gap-1 text-xs text-danger hover:text-danger"
                      >
                        <Ban className="h-3 w-3" />
                        Bekor qilish
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted border border-dashed border-border rounded-xl">
              Hozirda faol yoki kutilayotgan fon vazifalari yo'q.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
