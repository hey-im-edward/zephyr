import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
  {
    variants: {
      variant: {
        default: "border-white/56 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))] text-[#245b86]",
        secondary: "border-white/52 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06))] text-[var(--foreground)]",
        success: "border-white/52 bg-[rgba(97,171,136,0.14)] text-[var(--success)]",
        warning: "border-white/56 bg-[rgba(121,216,255,0.18)] text-[#245b86]",
        danger: "border-white/56 bg-[rgba(220,87,109,0.14)] text-[var(--danger)]",
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
