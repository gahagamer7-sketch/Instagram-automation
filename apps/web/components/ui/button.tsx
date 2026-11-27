import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "gradient" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold " +
  "transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_6px_18px_rgba(124,58,237,0.3)] hover:bg-primary-strong",
  gradient:
    "gradient-brand text-white shadow-[0_8px_24px_rgba(124,58,237,0.35)] hover:brightness-110",
  secondary:
    "border border-border bg-surface-2/80 text-text hover:border-primary/50 hover:bg-surface-2",
  danger: "bg-danger text-white hover:brightness-110",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
