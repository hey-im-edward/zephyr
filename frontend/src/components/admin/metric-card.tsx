"use client";

import type { ElementType } from "react";

import { formatVnd } from "@/lib/currency";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  note?: string;
  icon: ElementType;
  tint: "amber" | "rose" | "sky" | "emerald";
  currency?: boolean;
};

const tintClasses: Record<MetricCardProps["tint"], string> = {
  amber: "from-amber-300/22 via-amber-200/7 to-transparent",
  rose: "from-rose-300/22 via-rose-200/7 to-transparent",
  sky: "from-sky-300/22 via-sky-200/7 to-transparent",
  emerald: "from-emerald-300/22 via-emerald-200/7 to-transparent",
};

export function MetricCard({ label, value, note, icon: Icon, tint, currency = false }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(246,249,255,0.72))] p-5">
      <div className={cn("absolute inset-x-0 top-0 h-20 bg-gradient-to-br opacity-85", tintClasses[tint])} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--foreground-dim)]">{label}</div>
          <div className="font-display text-4xl font-semibold text-[var(--foreground-hero)]">
            {currency && typeof value === "number" ? formatVnd(value) : value}
          </div>
          {note ? <div className="text-sm leading-6 text-[var(--muted)]">{note}</div> : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] border border-[var(--line)] bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Icon className="h-5 w-5 text-[var(--foreground-hero)]" />
        </div>
      </div>
    </div>
  );
}
