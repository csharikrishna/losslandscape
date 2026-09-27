"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import SectionShell from "@/components/ui/SectionShell";
import { usePrefersReducedMotion } from "@/lib/motion";

export default function Hero() {
  const { scrollY } = useScroll();
  const reducedMotion = usePrefersReducedMotion();

  // Subtle fade and elevation rise during the first 350px of descent
  const opacity = useTransform(scrollY, [0, 350], [1, 0]);
  const yOffset = useTransform(scrollY, [0, 350], [0, -40]);

  return (
    <SectionShell id="hero" height="hero" align="center" className="text-center relative">
      {/* Radial backdrop for crisp text legibility against the 3D terrain */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#05070C]/85 via-[#05070C]/35 to-transparent pointer-events-none" />

      <motion.div
        style={{
          opacity: reducedMotion ? 1 : opacity,
          y: reducedMotion ? 0 : yOffset,
        }}
        className="relative z-10 mx-auto max-w-3xl"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="eyebrow justify-center"
        >
          An interactive expedition
        </motion.p>

        <motion.h1
          className="font-display text-[13vw] font-semibold leading-[1.05] tracking-tightest text-ink sm:text-7xl sm:leading-[0.95] lg:text-8xl mt-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="block text-ink">The Loss</span>
          <span className="block bg-elevation-ramp bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(34,184,176,0.35)]">
            Landscape
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-6 max-w-xl text-balance font-body text-base leading-[1.85] text-ink-dim/90 sm:text-lg"
        >
          Every neural network you&apos;ve ever trained was, geometrically, a single point
          crawling across a vast, high-dimensional terrain — searching for somewhere low.
          Scroll to fly through it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <span className="font-mono text-[12px] font-medium uppercase tracking-widest2 text-signal drop-shadow-[0_0_8px_rgba(143,247,224,0.3)]">
            <span className="hidden sm:inline">Scroll to descend</span>
            <span className="sm:hidden">Swipe up to descend</span>
          </span>
          <motion.svg
            width="18"
            height="28"
            viewBox="0 0 14 22"
            initial={{ y: 0 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="opacity-90 drop-shadow-[0_0_10px_rgba(143,247,224,0.4)]"
          >
            <rect
              x="1"
              y="1"
              width="12"
              height="20"
              rx="6"
              stroke="#8FF7E0"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="7" cy="7" r="1.6" fill="#8FF7E0" />
          </motion.svg>
        </motion.div>
      </motion.div>
    </SectionShell>
  );
}
