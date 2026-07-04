"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useScroll, useSpring, type MotionValue } from "framer-motion";

interface ScrollCtx {
  /** Raw 0→1 progress through the entire document. */
  progress: MotionValue<number>;
  /** Same value, critically-damped-springed for anything that should glide
   *  (the camera rig, the trajectory dot) rather than tick with the scroll. */
  smoothProgress: MotionValue<number>;
}

const ScrollContext = createContext<ScrollCtx | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  // No `target` → framer-motion tracks the whole document's scroll, which is
  // exactly the "one continuous journey" model this page wants.
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 20,
    mass: 0.6,
  });

  const value = useRef<ScrollCtx>({
    progress: scrollYProgress,
    smoothProgress,
  }).current;

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}

export function useJourneyScroll(): ScrollCtx {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useJourneyScroll must be used within <ScrollProvider>");
  }
  return ctx;
}
