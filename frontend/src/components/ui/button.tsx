"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--brand-gold),#c9aa77_52%,var(--brand-rose))] text-[var(--brand-ink)] shadow-[0_18px_48px_rgba(194,155,106,0.26)] hover:-translate-y-0.5 hover:brightness-105",
        secondary:
          "border border-white/12 bg-white/8 text-white hover:border-white/25 hover:bg-white/12",
        outline:
          "border border-white/16 bg-transparent text-white hover:border-white/30 hover:bg-white/6",
        ghost: "text-white/76 hover:bg-white/8 hover:text-white",
        destructive:
          "border border-[rgba(255,125,139,0.6)] bg-[linear-gradient(180deg,#ff7d8b,#e65063)] text-white shadow-[0_18px_38px_rgba(230,80,99,0.18)] hover:-translate-y-0.5 hover:brightness-105",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-sm",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
