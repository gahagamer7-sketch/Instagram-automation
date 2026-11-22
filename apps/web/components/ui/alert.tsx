import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "./badge";

const tones = {
  success: "border-success/40 bg-success/10 text-success",
  danger: "border-danger/40 bg-danger/10 text-danger",
  warning: "border-warning/40 bg-warning/10 text-warning",
  primary: "border-primary/40 bg-primary/10 text-primary",
  neutral: "border-border bg-surface-2 text-muted",
} satisfies Record<Tone, string>;

const icons = {
  success: CircleCheck,
  danger: CircleAlert,
  warning: TriangleAlert,
  primary: Info,
  neutral: Info,
} satisfies Record<Tone, typeof Info>;

/** Inline xabar — forma natijasini ekranda va screen reader'da ko'rsatadi. */
export function Alert({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const Icon = icons[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
        tones[tone],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
