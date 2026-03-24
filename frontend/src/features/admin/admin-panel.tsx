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
        "rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,27,0.92),rgba(5,10,21,0.88))] shadow-[0_24px_80px_rgba(2,6,23,0.36)]",
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
    <div className="flex flex-col gap-4 border-b border-white/8 px-6 py-6 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-semibold text-white">{title}</h2>
        <p className="max-w-3xl text-sm leading-7 text-white/58">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminPanelBody({ children, className }: AdminPanelProps) {
  return <div className={cn("px-6 py-6", className)}>{children}</div>;
}
