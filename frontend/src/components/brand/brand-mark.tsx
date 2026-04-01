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
    <div className={cn("brand-mark-shell relative isolate", className)} style={{ width: size, height: size }}>
      <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.15rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.12))]" />
      <div className="pointer-events-none absolute -left-[18%] top-[12%] h-[54%] w-[54%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.76),transparent_72%)] blur-xl" />
      <div className="pointer-events-none absolute bottom-[-12%] right-[-12%] h-[60%] w-[60%] rounded-full bg-[radial-gradient(circle,rgba(237,177,183,0.46),transparent_74%)] blur-2xl" />

      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="absolute inset-[14px] h-[calc(100%-28px)] w-[calc(100%-28px)]"
      >
        <path
          d="M12 38C17 22 28 13 50 12"
          fill="none"
          stroke="url(#zephyr-core)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5.4"
        />
        <path
          d="M14 48C24 42 34 33 44 19"
          fill="none"
          stroke="url(#zephyr-core-deep)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.6"
          opacity="0.9"
        />
        <path
          d="M28 34C31 31.5 34 28 37.5 22.5"
          fill="none"
          stroke="#79d8ff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.1"
          opacity="0.95"
        />
        <defs>
          <linearGradient id="zephyr-core" x1="12" x2="52" y1="12" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.42" stopColor="#79d8ff" />
            <stop offset="1" stopColor="#d7c1ff" />
          </linearGradient>
          <linearGradient id="zephyr-core-deep" x1="12" x2="46" y1="48" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#091426" />
            <stop offset="1" stopColor="#4eaed8" />
          </linearGradient>
        </defs>
      </svg>

      {shimmer ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)] mix-blend-screen"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: ["-105%", "210%"],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 6.4,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3.4,
                }
          }
        />
      ) : null}
    </div>
  );
}
