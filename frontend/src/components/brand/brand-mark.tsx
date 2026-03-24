"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: number;
  shimmer?: boolean;
};

export function BrandMark({ className, size = 52, shimmer = true }: BrandMarkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "brand-mark relative isolate overflow-hidden rounded-[1.45rem] border border-[var(--line-strong)] bg-[var(--surface-brand)] shadow-[0_18px_70px_rgba(6,9,20,0.42)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="absolute inset-[11px] h-[calc(100%-22px)] w-[calc(100%-22px)]"
      >
        <path
          d="M15 16.5H47.5L22 47.5H49"
          fill="none"
          stroke="url(#zephyr-stroke)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4.25"
        />
        <defs>
          <linearGradient id="zephyr-stroke" x1="13" x2="51" y1="16" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF4E5" />
            <stop offset="0.42" stopColor="#FDE68A" />
            <stop offset="1" stopColor="#F9A8D4" />
          </linearGradient>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.2),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.01))]" />

      {shimmer ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)] mix-blend-screen"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ["-120%", "260%"],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 4.8,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2.2,
                }
          }
        />
      ) : null}
    </div>
  );
}
