"use client";

import { createContext, useContext, useRef, useState, useMemo, type ReactNode } from "react";
import { useScroll, useSpring, type MotionValue } from "framer-motion";

interface ScrollCtx {
  /** Raw 0→1 progress through the entire document. */
  progress: MotionValue<number>;
  /** Same value, critically-damped-springed for anything that should glide
   *  (the camera rig, the trajectory dot) rather than tick with the scroll. */
  smoothProgress: MotionValue<number>;
  isExploreMode: boolean;
  setIsExploreMode: (val: boolean) => void;
}

const ScrollContext = createContext<ScrollCtx | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  // No `target` → framer-motion tracks the whole document's scroll, which is
  // exactly the "one continuous journey" model this page wants.
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 28,
    mass: 0.5,
  });

  const [isExploreMode, setIsExploreMode] = useState(false);

  const value = useMemo(() => ({
    progress: scrollYProgress,
    smoothProgress,
    isExploreMode,
    setIsExploreMode,
  }), [scrollYProgress, smoothProgress, isExploreMode]);

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}

export function useJourneyScroll(): ScrollCtx {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useJourneyScroll must be used within <ScrollProvider>");
  }
  return ctx;
}
