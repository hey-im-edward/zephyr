import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminPanelProps = {
  children: ReactNode;
  className?: string;
};

export function AdminPanel({ children, className }: AdminPanelProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,250,255,0.72))] shadow-[0_24px_80px_rgba(84,110,148,0.12)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AdminPanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--line)] px-6 py-6 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-semibold text-[var(--foreground-hero)]">{title}</h2>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminPanelBody({ children, className }: AdminPanelProps) {
  return <div className={cn("px-6 py-6", className)}>{children}</div>;
}
