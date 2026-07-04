"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useScroll, useSpring, type MotionValue } from "framer-motion";
import { usePathname } from "next/navigation";

interface ScrollCtx {
  progress: MotionValue<number>;
  smoothProgress: MotionValue<number>;
  isExploreMode: boolean;
  isNNMode: boolean;
}

const ScrollContext = createContext<ScrollCtx | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 28,
    mass: 0.5,
  });

  const pathname = usePathname();
  const isExploreMode = pathname === '/explore';
  const isNNMode = pathname === '/architecture';

  const value = useMemo(() => ({
    progress: scrollYProgress,
    smoothProgress,
    isExploreMode,
    isNNMode,
  }), [scrollYProgress, smoothProgress, isExploreMode, isNNMode]);

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}

export function useJourneyScroll(): ScrollCtx {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useJourneyScroll must be used within <ScrollProvider>");
  }
  return ctx;
}
