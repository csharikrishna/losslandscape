"use client";

import { useState } from "react";
import { motion, useTransform, useMotionValueEvent } from "framer-motion";
import { useJourneyScroll } from "@/lib/scroll-context";
import { JOURNEY, heightAt } from "@/lib/terrain-data";
import { stopProgress } from "@/lib/trajectory";

const stopHeights = JOURNEY.map(stop => heightAt(stop.x, stop.z));
const minH = Math.min(...stopHeights);
const maxH = Math.max(...stopHeights);
const hRange = maxH - minH || 1;

const getNormalizedY = (h: number) => {
  const normalized = (h - minH) / hRange; 
  // Map between 15% and 85% to stay inside bounds
  return 0.15 + (1 - normalized) * 0.7; 
};

const sparklinePoints = stopHeights.map((h, i) => {
  const x = (i / (JOURNEY.length - 1)) * 100;
  const y = getNormalizedY(h) * 100;
  return `${x},${y}`;
});
const sparklinePath = `M ${sparklinePoints.join(" L ")}`;

export default function Nav() {
  const { smoothProgress } = useJourneyScroll();
  const fillWidth = useTransform(smoothProgress, (p) => `${Math.max(0, Math.min(100, p * 100))}%`);
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    let closestIdx = 0;
    for (let i = 0; i < JOURNEY.length; i++) {
      const progress = stopProgress(i);
      const halfStep = 1 / (JOURNEY.length - 1) / 2;
      if (latest >= progress - halfStep && latest < progress + halfStep) {
        closestIdx = i;
        break;
      }
    }
    if (closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
    }
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <a
          href="#hero"
          className="font-display text-sm font-semibold tracking-tight text-ink"
        >
          Loss<span className="text-signal">Landscape</span>
          <span className="ml-2 hidden font-mono text-[11px] font-normal text-ink-faint sm:inline">
            L(θ)
          </span>
        </a>

        <div className="relative hidden h-12 w-[280px] items-center lg:flex" aria-label="Journey stops">
          {/* Base faded sparkline */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={sparklinePath}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Filled active sparkline */}
          <motion.div 
            className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
            style={{ width: fillWidth }}
          >
            <svg className="absolute left-0 top-0 h-full w-[280px]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={sparklinePath}
                stroke="#8FF7E0"
                strokeWidth="2.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-[0_0_8px_rgba(143,247,224,0.6)]"
              />
            </svg>
          </motion.div>

          {JOURNEY.map((stop, i) => {
            const isActive = i === activeIndex;
            const isPast = i <= activeIndex;
            
            const xPercent = (i / (JOURNEY.length - 1)) * 100;
            const yPercent = getNormalizedY(stopHeights[i]) * 100;

            return (
              <a
                key={stop.id}
                href={`#${stop.id}`}
                title={stop.title}
                className="group absolute flex h-8 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`
                }}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[1.75] group-hover:bg-signal group-hover:shadow-[0_0_8px_rgba(143,247,224,0.8)] ${
                    isActive ? "bg-signal shadow-[0_0_10px_rgba(143,247,224,0.8)] scale-125" : isPast ? "bg-signal/70" : "bg-ink-dim/30 hover:bg-ink-dim/80"
                  }`}
                  aria-hidden="true"
                />
                <span 
                  className={`pointer-events-none absolute -bottom-3 z-10 translate-y-full whitespace-nowrap rounded-md border border-signal/20 bg-[#0D1220]/90 px-2 py-1 font-mono text-[11px] text-signal opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:-bottom-2 group-hover:opacity-100 ${
                    i === 0 ? "left-0" : i === JOURNEY.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  {stop.title}
                </span>
                <span className="sr-only">{stop.title}</span>
              </a>
            );
          })}
        </div>

        <a
          href="#read-pdf"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:border-signal/50 hover:text-signal"
        >
          Read the PDF
        </a>
      </div>

      <div className="h-[2px] w-full bg-white/5">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-elevation-low via-elevation-mid to-elevation-high"
          style={{ scaleX: smoothProgress }}
        />
      </div>
    </header>
  );
}
