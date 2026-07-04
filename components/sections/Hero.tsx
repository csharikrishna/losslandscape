"use client";

import { motion, useTransform } from "framer-motion";
import SectionShell from "@/components/ui/SectionShell";
import { useJourneyScroll } from "@/lib/scroll-context";

export default function Hero() {
  const { smoothProgress } = useJourneyScroll();
  // Fade out during the first 4% of the document scroll (the descent)
  const opacity = useTransform(smoothProgress, [0, 0.04], [1, 0]);
  const yOffset = useTransform(smoothProgress, [0, 0.04], [0, -50]);
  return (
    <SectionShell id="hero" height="hero" align="center" className="text-center relative">
      {/* Subtle radial gradient backdrop for better text legibility against the 3D terrain */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#05070C]/80 via-[#05070C]/30 to-transparent pointer-events-none" />
      
      <motion.div style={{ opacity, y: yOffset }} className="relative z-10 mx-auto max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="eyebrow justify-center"
        >
          An interactive expedition
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[13vw] font-semibold leading-[0.95] tracking-tightest text-ink sm:text-7xl lg:text-8xl"
        >
          The Loss
          <br />
          <span className="bg-elevation-ramp bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,184,176,0.4)] bg-[length:200%_auto] animate-shimmer">
            Landscape
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-7 max-w-xl text-balance font-body text-base leading-relaxed text-ink-dim/90 sm:text-lg"
        >
          Every neural network you&apos;ve ever trained was, geometrically, a single point
          crawling across a vast, high-dimensional terrain — searching for somewhere low.
          Scroll to fly through it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <span className="font-mono text-[12px] font-medium uppercase tracking-widest2 text-signal drop-shadow-[0_0_8px_rgba(143,247,224,0.3)]">
            <span className="hidden sm:inline">Scroll to descend</span>
            <span className="sm:hidden">Swipe up to descend</span>
          </span>
          <motion.svg
            width="18"
            height="28"
            viewBox="0 0 14 22"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="opacity-90 drop-shadow-[0_0_10px_rgba(143,247,224,0.4)]"
          >
            <rect x="1" y="1" width="12" height="20" rx="6" stroke="#8FF7E0" strokeWidth="1.5" fill="none" />
            <circle cx="7" cy="7" r="1.6" fill="#8FF7E0" />
          </motion.svg>
        </motion.div>
      </motion.div>
    </SectionShell>
  );
}
