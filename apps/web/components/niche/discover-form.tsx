"use client";

import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Sparkles,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Palette,
  PlayCircle,
} from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { discoverNichesAction, selectCandidateAction } from "@/app/niche/actions";
import { scoreLabel } from "@/lib/niche";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";

export interface NicheCandidate {
  id?: string;
  niche: string;
  source: string;
  status?: string;
  scores: import("@/lib/niche").NicheScores;
  signals: Record<string, unknown>;
}

export function DiscoverForm({
  initialCandidates = [],
  currentNiche = null,
}: {
  initialCandidates?: NicheCandidate[];
  currentNiche?: string | null;
}) {
  const [discoverState, discoverAction, discovering] = useActionState(
    discoverNichesAction,
    null,
  );

  const candidates = discoverState?.candidates ?? initialCandidates;

  return (
    <>
      {discoverState && !discoverState.ok && (
        <div className="mb-4">
          <Alert tone="danger">{discoverState.message}</Alert>
        </div>
      )}

      {discoverState?.ok && (
        <div className="mb-4">
          <Alert tone="success">{discoverState.message}</Alert>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <div>
          5 mezon: talab, raqobat zichligi, avtomatlashtirish qulayligi,
          monetizatsiya salohiyati, kontent zaxirasi.
        </div>
        {currentNiche && (
          <div className="flex items-center gap-2">
            <span className="text-text">Faol kanal nishasi:</span>
            <Badge tone="success">{currentNiche}</Badge>
            <Link
              href={`/brand?niche=${encodeURIComponent(currentNiche)}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline ml-1"
            >
              <Palette className="h-3.5 w-3.5" />
              Brendga o'tish
            </Link>
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-end">
        <form action={discoverAction}>
          <Button type="submit" variant="gradient" disabled={discovering}>
            {discovering ? (
              <Clock className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {discovering ? "Qidirilmoqda..." : "Yangi kashfiyotni boshlash"}
          </Button>
        </form>
      </div>

      {candidates.length > 0 ? (
        <CandidatesList candidates={candidates} currentNiche={currentNiche} />
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="Hali nomzod nisha yo'q"
          description="Kashfiyotni boshlaganda YouTube (UZ) va Gemini AI signallari asosida eng istiqbolli nishalar yig'iladi va 5 mezon bo'yicha baholanadi."
          action={
            <form action={discoverAction} className="mt-4">
              <Button type="submit" variant="gradient" disabled={discovering}>
                {discovering ? (
                  <Clock className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden />
                )}
                {discovering ? "Izlanmoqda..." : "Kashfiyotni hoziroq boshlash"}
              </Button>
            </form>
          }
        />
      )}
    </>
  );
}

function CandidatesList({
  candidates,
  currentNiche,
}: {
  candidates: NicheCandidate[];
  currentNiche: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelect = (id: string, mode: "winner" | "testing") => {
    startTransition(async () => {
      const res = await selectCandidateAction(id, mode);
      setFeedback(res.message);
    });
  };

  const winner = candidates.find((c) => c.status === "winner") || candidates[0];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-border bg-surface-2">
        <div>
          <h3 className="font-semibold text-text">Saralangan nishalar ({candidates.length})</h3>
          <p className="text-xs text-muted">
            Ball bo'yicha tartiblangan — eng yuqori ballga ega nomzod g'olib hisoblanadi.
          </p>
        </div>
        {winner && (
          <Badge tone="success" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            Yetakchi: {winner.niche}
          </Badge>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-surface border-b border-border text-xs text-success font-medium flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {feedback}
        </div>
      )}

      <ul className="divide-y divide-border">
        {candidates.map((c, i) => {
          const isSelected = currentNiche === c.niche || c.status === "winner";
          const isTesting = c.status === "testing";

          return (
            <li
              key={c.id || c.niche}
              className={`p-4 transition hover:bg-surface-2/40 ${
                isSelected ? "bg-primary/5 border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`nums font-semibold text-sm ${
                          i === 0 ? "text-primary" : "text-muted"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <span className="font-medium text-text text-base">{c.niche}</span>
                      <Badge tone={c.source === "youtube" ? "warning" : "primary"}>
                        {c.source.toUpperCase()}
                      </Badge>
                      {isSelected && (
                        <Badge tone="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Tanlangan nisha
                        </Badge>
                      )}
                      {isTesting && (
                        <Badge tone="warning" className="gap-1">
                          <PlayCircle className="h-3 w-3" />
                          14 kunlik sinovda
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      Qiziqish indeksi: {(Number(c.signals.interest ?? 0.5) * 100).toFixed(0)}%
                      {c.signals.channel ? ` • Manba kanali: ${c.signals.channel}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    tone={
                      c.scores.total >= 0.65
                        ? "success"
                        : c.scores.total >= 0.5
                          ? "warning"
                          : "danger"
                    }
                  >
                    {scoreLabel(c.scores.total)}
                    <span className="nums ml-1 font-semibold">{c.scores.total}</span>
                  </Badge>

                  {c.id && !isSelected && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => handleSelect(c.id!, "winner")}
                    >
                      G'olib deb tanlash
                    </Button>
                  )}

                  {isSelected ? (
                    <Link
                      href={`/brand?niche=${encodeURIComponent(c.niche)}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition shadow-sm"
                    >
                      <Palette className="h-3.5 w-3.5" />
                      Brend yaratish
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    c.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleSelect(c.id!, "testing")}
                      >
                        Sinovga olish
                      </Button>
                    )
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: "Talab", value: c.scores.demand, key: "demand" },
                  { label: "Raqobat kamligi", value: c.scores.competition, key: "competition" },
                  { label: "Avtomatlashtirish", value: c.scores.automation, key: "automation" },
                  { label: "Monetizatsiya", value: c.scores.monetization, key: "monetization" },
                  { label: "Kontent zaxirasi", value: c.scores.contentReserve, key: "contentReserve" },
                ].map((m) => (
                  <div
                    key={m.key}
                    className="rounded-lg border border-border bg-surface px-2.5 py-2"
                  >
                    <div className="text-[11px] text-muted">{m.label}</div>
                    <div className="nums text-sm font-semibold text-text">
                      {m.value}
                    </div>
                    <div className="h-1.5 mt-1 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full gradient-brand rounded-full transition-all"
                        style={{ width: `${Math.round(m.value * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
