"use client";

import {
  ListChecks,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Ban,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Cpu,
  Bot,
} from "lucide-react";
import { useState } from "react";
import { retryJobAction, cancelJobAction } from "@/app/pipeline/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { formatDateTime, formatUsd } from "@/lib/format";

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface JobItem {
  id: string;
  type: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  payload: Record<string, unknown> | null;
  runAt: string;
  createdAt: string;
}

export interface CostLogItem {
  id: string;
  provider: string;
  kind: string;
  amount: number;
  costUsd: number;
  limitHit: boolean;
  createdAt: string;
}

export interface LogsViewProps {
  auditLogs: AuditLogItem[];
  jobs: JobItem[];
  costLogs: CostLogItem[];
  totalCostUsd: number;
}

export function LogsView({
  auditLogs = [],
  jobs = [],
  costLogs = [],
  totalCostUsd = 0,
}: LogsViewProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "jobs" | "costs">("audit");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  const filteredAudit = auditLogs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.actor.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      (log.target && log.target.toLowerCase().includes(q))
    );
  });

  const filteredJobs = jobs.filter((job) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return job.type.toLowerCase().includes(q) || job.status.toLowerCase().includes(q);
  });

  const filteredCosts = costLogs.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.provider.toLowerCase().includes(q) || c.kind.toLowerCase().includes(q);
  });

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
      {feedback && (
        <div>
          <Alert tone={feedback.tone}>{feedback.message}</Alert>
        </div>
      )}

      {/* Navigatsiya Tablari va Qidiruv */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex rounded-2xl border border-border bg-surface p-1 gap-1 shadow-sm">
          {[
            { id: "audit", label: "Audit Loglari", count: auditLogs.length, icon: Activity },
            { id: "jobs", label: "Jobs Navbati", count: jobs.length, icon: ListChecks },
            { id: "costs", label: "Xarajatlar (Cost)", count: costLogs.length, icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setExpandedId(null);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span className="nums opacity-75">({tab.count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Loglar orasidan qidirish..."
            className="w-full rounded-xl border border-border bg-surface pl-9 pr-3.5 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* 1. AUDIT LOGLARI */}
      {activeTab === "audit" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
            <h3 className="font-semibold text-text text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Tizim Harakatlari Tarixi (Kim, nima, qachon)
            </h3>
            <span className="text-xs text-muted">Jami: {filteredAudit.length} ta yozuv</span>
          </div>

          {filteredAudit.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredAudit.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <div key={log.id} className="p-4 hover:bg-surface-2/40 transition">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Badge
                          tone={
                            log.actor === "admin"
                              ? "primary"
                              : log.actor === "worker"
                                ? "warning"
                                : "neutral"
                          }
                          className="gap-1 font-mono uppercase"
                        >
                          {log.actor === "admin" ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Cpu className="h-3 w-3" />
                          )}
                          {log.actor}
                        </Badge>

                        <span className="font-semibold text-text">{log.action}</span>
                        {log.target && (
                          <span className="text-muted font-mono text-[11px]">
                            → {log.target}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="nums text-muted text-[11px]">
                          {formatDateTime(log.createdAt)}
                        </span>
                        {log.details && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            className="text-primary hover:underline flex items-center gap-0.5 text-[11px]"
                          >
                            {isExpanded ? "Yopish" : "Tafsilot"}
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && log.details && (
                      <div className="mt-3 p-3 rounded-xl bg-surface-2 border border-border">
                        <pre className="font-mono text-[11px] text-text overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted">
              Audit loglari topilmadi.
            </div>
          )}
        </Card>
      )}

      {/* 2. JOBS NAVBATI */}
      {activeTab === "jobs" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
            <h3 className="font-semibold text-text text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Fon Vazifalari Navbati (Jobs Queue)
            </h3>
            <span className="text-xs text-muted">Jami: {filteredJobs.length} ta vazifa</span>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredJobs.map((job) => {
                const isExpanded = expandedId === job.id;
                return (
                  <div key={job.id} className="p-4 hover:bg-surface-2/40 transition">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text text-sm">{job.type}</span>
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
                          <span className="nums text-muted text-[11px]">
                            ({job.attempts}/{job.maxAttempts} urinish)
                          </span>
                        </div>

                        {job.error ? (
                          <p className="text-danger mt-1 text-[11px] font-mono break-all">
                            {job.error}
                          </p>
                        ) : (
                          <p className="text-muted mt-0.5 text-[11px]">
                            Rejalashtirilgan vaqt: {formatDateTime(job.runAt)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
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

                        {job.payload && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : job.id)}
                            className="text-primary hover:underline flex items-center gap-0.5 text-xs ml-2"
                          >
                            Payload
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && job.payload && (
                      <div className="mt-3 p-3 rounded-xl bg-surface-2 border border-border">
                        <pre className="font-mono text-[11px] text-text overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(job.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted">
              Navbatda faol yoki kutilayotgan vazifa yo'q.
            </div>
          )}
        </Card>
      )}

      {/* 3. XARAJATLAR TAHLILI (COST LOGS) */}
      {activeTab === "costs" && (
        <Card className="overflow-hidden space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-text text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                API Xarajatlari va Tokenlar Nazorati
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Har bir AI provayderi (matn, TTS, rasm) bo'yicha hisob-kitob (TZ 4.10).
              </p>
            </div>
            <div className="p-3 rounded-xl border border-success/30 bg-success/10 text-right">
              <span className="text-[11px] text-muted block">Jami xarajat:</span>
              <span className="nums text-lg font-bold text-success">
                {formatUsd(totalCostUsd)}
              </span>
            </div>
          </div>

          {filteredCosts.length > 0 ? (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
              {filteredCosts.map((cost) => (
                <div
                  key={cost.id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-surface-2/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <Badge tone="primary" className="uppercase font-mono">
                      {cost.provider}
                    </Badge>
                    <span className="font-semibold text-text">{cost.kind}</span>
                    <span className="nums text-muted text-[11px]">
                      Hajm: {cost.amount}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="nums font-bold text-text">
                      {formatUsd(cost.costUsd)}
                    </span>
                    <span className="nums text-muted text-[11px]">
                      {formatDateTime(cost.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted border border-dashed border-border rounded-xl">
              Hozircha xarajat yozuvlari mavjud emas (bepul tarif limitlarida ishlanmoqda).
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

