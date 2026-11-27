import { ChevronDown, ExternalLink, KeyRound } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatUsd } from "@/lib/format";
import type { CredentialView } from "@/lib/credentials";
import type { ProviderMeta } from "@/lib/providers";
import { KeyForm } from "./key-form";
import { TestButton } from "./test-button";

const STATUS: Record<string, { tone: Tone; label: string }> = {
  connected: { tone: "success", label: "Ulangan" },
  unverified: { tone: "warning", label: "Tekshirilmagan" },
  error: { tone: "danger", label: "Xato" },
  quota_warning: { tone: "warning", label: "Kvota tugayapti" },
};

export function ProviderCard({
  meta,
  credential,
}: {
  meta: ProviderMeta;
  credential?: CredentialView;
}) {
  const status = credential ? (STATUS[credential.status] ?? STATUS.unverified!) : undefined;

  return (
    <Card className="flex flex-col hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold text-text">{meta.label}</h3>
          <p className="mt-1 text-sm text-muted leading-relaxed">{meta.description}</p>
        </div>
        {status ? (
          <Badge tone={status.tone}>{status.label}</Badge>
        ) : (
          <Badge tone="neutral">Kiritilmagan</Badge>
        )}
      </div>

      {credential ? (
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <dt className="sr-only">Kalit</dt>
            <dd className="font-mono text-xs tracking-wider">••••••••{credential.last4}</dd>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              Tekshirilgan: <span className="nums">{formatDateTime(credential.lastCheckedAt)}</span>
            </span>
            <span>
              Xarajat: <span className="nums">{formatUsd(credential.monthlySpent)}</span>
              {credential.monthlyLimit ? (
                <span className="nums"> / {formatUsd(credential.monthlyLimit)}</span>
              ) : null}
            </span>
          </div>
          {credential.lastError && credential.status !== "connected" ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger">
              {credential.lastError}
            </p>
          ) : null}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Kalit kiritilmaguncha tegishli bosqich &quot;kalit kerak&quot; holatida turadi.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {credential && meta.testable ? <TestButton id={credential.id} /> : null}
        {credential && !meta.testable ? (
          <span className="text-xs text-muted">
            Bu provayder uchun tekshiruv keyingi bosqichda qo&apos;shiladi.
          </span>
        ) : null}
        {meta.docsUrl ? (
          <a
            href={meta.docsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Kalitni olish: {meta.docsLabel}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : null}
      </div>

      <details className="group mt-4 border-t border-border pt-4" open={!credential}>
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-muted hover:text-text">
          {credential ? "Kalitni almashtirish" : "Kalitni kiritish"}
          <ChevronDown
            className="h-4 w-4 transition group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-4">
          <KeyForm
            provider={meta.id}
            keyLabel={meta.keyLabel}
            configured={Boolean(credential)}
          />
        </div>
      </details>
    </Card>
  );
}
