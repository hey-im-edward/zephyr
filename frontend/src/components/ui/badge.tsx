import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default: "border-[rgba(229,199,139,0.2)] bg-[rgba(229,199,139,0.16)] text-[var(--brand-soft)]",
        secondary: "border-white/12 bg-white/8 text-white",
        success: "border-emerald-400/18 bg-emerald-400/14 text-emerald-100",
        warning: "border-[rgba(243,193,113,0.2)] bg-[rgba(243,193,113,0.16)] text-[var(--warning)]",
        danger: "border-[rgba(255,125,139,0.24)] bg-[rgba(255,125,139,0.14)] text-[#ffd4da]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
