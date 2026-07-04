"use client";

import { useState } from "react";
import { motion, useTransform, useMotionValueEvent } from "framer-motion";
import { useJourneyScroll } from "@/lib/scroll-context";
import { JOURNEY, heightAt } from "@/lib/terrain-data";
import { stopProgress } from "@/lib/trajectory";
import { useMovieMode } from "@/lib/useMovieMode";
import { useAudioDrone } from "@/lib/useAudioDrone";

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
  const { isPlaying, setIsPlaying } = useMovieMode();
  const { isAudioOn, setIsAudioOn } = useAudioDrone();

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/15 bg-white/5 text-ink-dim transition-colors hover:border-signal/50 hover:text-signal"
            title={isAudioOn ? "Mute Ambient Sound" : "Play Ambient Sound"}
          >
            {isAudioOn ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            )}
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:border-signal/50 hover:text-signal"
          >
            {isPlaying ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Movie
              </>
            )}
          </button>
          <a
            href="#read-pdf"
            className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:border-signal/50 hover:text-signal sm:inline-block"
          >
            PDF
          </a>
        </div>
      </div>

    </header>
  );
}
