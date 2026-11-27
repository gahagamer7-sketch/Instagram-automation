import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-border bg-surface-2/80 text-muted",
  primary: "border-primary/40 bg-primary/15 text-violet-300",
  success: "border-success/40 bg-success/15 text-emerald-300",
  warning: "border-warning/40 bg-warning/15 text-amber-300",
  danger: "border-danger/40 bg-danger/15 text-red-300",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Holat nuqtasi — yuqori panel va kartalarda ishlatiladi. */
export function StatusDot({
  tone = "success",
  pulse = false,
}: {
  tone?: Tone;
  pulse?: boolean;
}) {
  const color =
    tone === "success"
      ? "bg-success"
      : tone === "danger"
        ? "bg-danger"
        : tone === "warning"
          ? "bg-warning"
          : tone === "primary"
            ? "bg-primary"
            : "bg-muted";

  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-65",
            color,
          )}
        />
      )}
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", color)} />
    </span>
  );
}
