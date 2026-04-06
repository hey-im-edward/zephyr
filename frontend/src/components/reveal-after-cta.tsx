"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type RevealAfterCtaProps = {
  children: React.ReactNode;
  ctaSelector?: string;
  className?: string;
};

const ULTRA_COMPACT_QUERY = "(max-width: 319px)";

export function RevealAfterCta({ children, ctaSelector = "#pdp-cta-zone", className }: RevealAfterCtaProps) {
  const [isUltraCompact, setIsUltraCompact] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(ULTRA_COMPACT_QUERY);

    const updateMode = () => {
      const compact = mediaQuery.matches;
      setIsUltraCompact(compact);
      setIsUnlocked(!compact);
    };

    updateMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMode);
      return () => mediaQuery.removeEventListener("change", updateMode);
    }

    mediaQuery.addListener(updateMode);
    return () => mediaQuery.removeListener(updateMode);
  }, []);

  useEffect(() => {
    if (!isUltraCompact) {
      return;
    }

    const ctaElement = document.querySelector<HTMLElement>(ctaSelector);
    if (!ctaElement) {
      return;
    }

    const updateUnlockState = () => {
      const ctaBottom = ctaElement.getBoundingClientRect().bottom;
      const triggerLine = Math.max(0, window.innerHeight * 0.22);
      if (ctaBottom <= triggerLine) {
        setIsUnlocked(true);
      }
    };

    updateUnlockState();
    window.addEventListener("scroll", updateUnlockState, { passive: true });
    window.addEventListener("resize", updateUnlockState);

    return () => {
      window.removeEventListener("scroll", updateUnlockState);
      window.removeEventListener("resize", updateUnlockState);
    };
  }, [ctaSelector, isUltraCompact]);

  return <div className={cn(className, isUltraCompact && !isUnlocked ? "hidden" : undefined)}>{children}</div>;
}