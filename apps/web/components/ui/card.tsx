import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("card p-5 transition-colors duration-200", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="font-heading text-base font-semibold text-text">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
