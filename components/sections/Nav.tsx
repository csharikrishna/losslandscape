"use client";

import { useState, useEffect } from "react";
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
  return 0.15 + (1 - normalized) * 0.7; 
};

const sparklinePoints = stopHeights.map((h, i) => {
  const x = (i / (JOURNEY.length - 1)) * 100;
  const y = getNormalizedY(h) * 100;
  return `${x},${y}`;
});
const sparklinePath = `M ${sparklinePoints.join(" L ")}`;

/** Small SVG countdown ring shown when Movie Mode pauses for reading */
function CountdownRing({ seconds }: { seconds: number }) {
  if (seconds <= 0) return null;
  
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="fixed bottom-8 right-8 z-[60] flex items-center gap-3">
      <svg width="32" height="32" viewBox="0 0 28 28" className="drop-shadow-lg">
        <circle
          cx="14" cy="14" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <circle
          cx="14" cy="14" r={radius}
          fill="none"
          stroke="#8FF7E0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={0}
          style={{
            transition: 'stroke-dashoffset 1s linear',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <span className="font-mono text-xs text-signal/80">{seconds}s</span>
    </div>
  );
}

export default function Nav() {
  const { smoothProgress, isExploreMode, setIsExploreMode } = useJourneyScroll();
  const fillWidth = useTransform(smoothProgress, (p) => `${Math.max(0, Math.min(100, p * 100))}%`);
  const [activeIndex, setActiveIndex] = useState(0);
  const { isPlaying, setIsPlaying, toggle, pauseRemaining } = useMovieMode();
  const { isAudioOn, setIsAudioOn } = useAudioDrone();

  // Nav backdrop opacity — transparent at top, dark after hero
  const backdropOpacity = useTransform(smoothProgress, [0, 0.06], [0, 1]);

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

  // Keyboard: M to toggle audio
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && !e.repeat) {
        setIsAudioOn(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setIsAudioOn]);

  const handleSparklineClick = (e: React.MouseEvent, stopId: string) => {
    e.preventDefault();
    const el = document.getElementById(stopId);
    if (el) {
      el.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }
  };

  return (
    <>
      {/* Main nav — hidden during movie mode */}
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{
          opacity: isPlaying || isExploreMode ? 0 : 1,
          y: isPlaying || isExploreMode ? -20 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: isPlaying || isExploreMode ? 'none' : 'auto' }}
      >
        {/* Dark gradient backdrop that fades in after hero */}
        <motion.div
          className="absolute inset-0 -z-10 backdrop-blur-sm"
          style={{
            opacity: backdropOpacity,
            background: 'linear-gradient(180deg, rgba(5,7,12,0.85) 0%, rgba(5,7,12,0.4) 80%, transparent 100%)',
          }}
        />

        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#hero"
            onClick={(e) => handleSparklineClick(e, 'hero')}
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
                  onClick={(e) => handleSparklineClick(e, stop.id)}
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
              title={isAudioOn ? "Mute (M)" : "Sound (M)"}
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
              onClick={() => setIsExploreMode(true)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:border-signal/50 hover:text-signal"
              title="Explore freely (WASD + Mouse)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              Explore
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:border-signal/50 hover:text-signal"
              title="Toggle Movie Mode (Space)"
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
              onClick={(e) => handleSparklineClick(e, 'read-pdf')}
              className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:border-signal/50 hover:text-signal sm:inline-block"
            >
              PDF
            </a>
          </div>
        </div>

      </motion.header>

      {/* Floating stop button visible ONLY during Movie or Explore Mode */}
      {(isPlaying || isExploreMode) && (
        <motion.button
          className="fixed right-6 top-6 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-void/60 text-ink-dim backdrop-blur-md transition-colors hover:border-signal/50 hover:text-signal"
          onClick={() => {
            setIsPlaying(false);
            setIsExploreMode(false);
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          title={isPlaying ? "Stop Movie Mode (Space)" : "Exit Explore Mode"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </motion.button>
      )}

      {/* Explore Mode Controls Guide */}
      {isExploreMode && (
        <motion.div
          className="fixed bottom-8 left-8 z-[60] flex flex-col gap-2 rounded-xl border border-white/10 bg-void/60 p-5 text-xs font-mono text-ink-dim backdrop-blur-md shadow-2xl"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-2 flex items-center gap-2 font-sans text-[13px] font-medium text-white/90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-signal">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            Flight Controls
          </div>
          <div className="flex justify-between gap-12 border-b border-white/5 pb-2">
            <span className="text-white/80">W A S D</span>
            <span className="text-white/40">Move</span>
          </div>
          <div className="flex justify-between gap-12 border-b border-white/5 py-2">
            <span className="text-white/80">R / F</span>
            <span className="text-white/40">Up / Down</span>
          </div>
          <div className="flex justify-between gap-12 pt-2">
            <span className="text-white/80">Click + Drag</span>
            <span className="text-white/40">Look Around</span>
          </div>
        </motion.div>
      )}

      {/* Countdown ring during reading pauses */}
      {isPlaying && <CountdownRing seconds={pauseRemaining} />}
    </>
  );
}
