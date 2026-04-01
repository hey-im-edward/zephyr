"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "liquid-button-shell text-[var(--foreground-hero)] hover:-translate-y-0.5 hover:border-white/80 hover:brightness-[1.03]",
        secondary:
          "liquid-button-shell liquid-button-shell-secondary text-[var(--foreground)] hover:-translate-y-0.5 hover:border-white/76",
        outline:
          "border border-white/56 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] text-[var(--foreground)] backdrop-blur-[18px] hover:border-white/74 hover:bg-white/12",
        ghost: "border border-transparent bg-transparent text-[var(--foreground)] hover:border-white/40 hover:bg-white/12",
        destructive:
          "border border-[rgba(220,87,109,0.24)] bg-[linear-gradient(180deg,#ef8899,#dc576d)] text-white shadow-[0_18px_38px_rgba(220,87,109,0.16)] hover:-translate-y-0.5 hover:brightness-105",
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
