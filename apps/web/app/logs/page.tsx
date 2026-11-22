import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import {
  LogsView,
  type AuditLogItem,
  type JobItem,
  type CostLogItem,
} from "@/components/logs/logs-view";

export const metadata = {
  title: "Navbat va loglar — AutoChannel",
};

export default function LogsPage() {
  return (
    <>
      <PageHeader
        title="Navbat va loglar"
        description="Tizim audit loglari, fon vazifalari (jobs) navbati va API xarajatlari nazorati (TZ 4.8, 4.10)."
      />

      <Suspense fallback={<CardSkeleton lines={8} />}>
        <LogsContent />
      </Suspense>
    </>
  );
}

async function LogsContent() {
  try {
    const [auditLogsRaw, jobsRaw, costLogsRaw, costAggregate] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.costLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.costLog.aggregate({
        _sum: { costUsd: true },
      }),
    ]);

    const auditLogs: AuditLogItem[] = auditLogsRaw.map((log) => ({
      id: log.id,
      actor: log.actor,
      action: log.action,
      target: log.target,
      details:
        log.details && typeof log.details === "object"
          ? (log.details as Record<string, unknown>)
          : null,
      createdAt: log.createdAt.toISOString(),
    }));

    const jobs: JobItem[] = jobsRaw.map((job) => ({
      id: job.id,
      type: job.type,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      error: job.error,
      payload:
        job.payload && typeof job.payload === "object"
          ? (job.payload as Record<string, unknown>)
          : null,
      runAt: job.runAt.toISOString(),
      createdAt: job.createdAt.toISOString(),
    }));

    const costLogs: CostLogItem[] = costLogsRaw.map((cost) => ({
      id: cost.id,
      provider: cost.provider,
      kind: cost.kind,
      amount: cost.amount,
      costUsd: cost.costUsd,
      limitHit: cost.limitHit,
      createdAt: cost.createdAt.toISOString(),
    }));

    const totalCostUsd = costAggregate._sum.costUsd ?? 0;

    return (
      <LogsView
        auditLogs={auditLogs}
        jobs={jobs}
        costLogs={costLogs}
        totalCostUsd={totalCostUsd}
      />
    );
  } catch (err) {
    console.error("LogsContent load error:", err);
    return (
      <LogsView
        auditLogs={[]}
        jobs={[]}
        costLogs={[]}
        totalCostUsd={0}
      />
    );
  }
}
