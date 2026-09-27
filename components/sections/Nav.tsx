"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { JOURNEY, heightAt } from "@/lib/journey";
import { useActiveStop } from "@/lib/useJourneyScroll";
import { useMode, setMode, commandResetNNCamera, commandToggleTour } from "@/lib/mode-store";
import { useMovieMode } from "@/lib/useMovieMode";
import { useAudio } from "@/lib/audio-context";

const stopHeights = JOURNEY.map((stop) => heightAt(stop.x, stop.z));
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
  // Dwell is 5 seconds
  const strokeDashoffset = circumference * (1 - Math.min(5, Math.max(0, seconds)) / 5);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[65] flex items-center gap-2.5 rounded-full border border-signal/20 bg-void/90 px-3 py-1.5 backdrop-blur-md shadow-xl"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" className="rotate-[-90deg]">
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="#8FF7E0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span className="font-mono text-xs text-signal font-medium">{seconds}s</span>
    </div>
  );
}

export default function Nav() {
  const mode = useMode();
  const activeStop = useActiveStop();
  const { isPlaying, toggle, dwellSeconds, stop: stopMovie } = useMovieMode();
  const { toggleMute } = useAudio();

  const isExploreMode = mode === "explore";
  const isNNMode = mode === "architecture";
  const isModeActive = isExploreMode || isNNMode;

  const { scrollY } = useScroll();
  const backdropOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  // Handle M key for audio mute
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.code === "KeyM" && !e.repeat) {
        toggleMute();
      } else if (e.code === "Escape") {
        if (isModeActive) {
          setMode("journey");
        }
        if (isPlaying) {
          stopMovie();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleMute, isModeActive, isPlaying, stopMovie]);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (isModeActive) {
      setMode("journey");
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Semantic accessible navigation bar */}
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        className="fixed inset-x-0 top-0 z-50 transition-transform duration-300"
        style={{
          pointerEvents: isPlaying ? "none" : "auto",
          transform: isPlaying ? "translateY(-100%)" : "translateY(0%)",
        }}
      >
        {/* Subtle backdrop fading in on scroll */}
        <motion.div
          className="absolute inset-0 -z-10 backdrop-blur-md border-b border-white/5"
          style={{
            opacity: backdropOpacity,
            background:
              "linear-gradient(180deg, rgba(5,7,12,0.88) 0%, rgba(5,7,12,0.65) 100%)",
          }}
        />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          {/* Brand */}
          <a
            href="#hero"
            onClick={(e) => handleScrollTo(e, "hero")}
            className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-ink hover:text-white transition-colors"
          >
            <span>
              Loss<span className="text-signal">Landscape</span>
            </span>
            <span className="hidden font-mono text-[11px] font-normal text-ink-faint sm:inline">
              L(θ)
            </span>
          </a>

          {/* Interactive sparkline journey track (Desktop) */}
          <div
            className="relative hidden h-10 w-[260px] items-center lg:flex"
            aria-label="Journey stops progress"
          >
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d={sparklinePath}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {JOURNEY.map((stop, i) => {
              const isActive = i === activeStop;
              const isPast = i <= activeStop;
              const xPercent = (i / (JOURNEY.length - 1)) * 100;
              const yPercent = getNormalizedY(stopHeights[i]) * 100;

              return (
                <a
                  key={stop.id}
                  href={`#${stop.id}`}
                  onClick={(e) => handleScrollTo(e, stop.id)}
                  title={`${stop.title} (Stop ${i + 1} of ${JOURNEY.length})`}
                  className="group absolute flex h-10 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus-visible:outline-none"
                  style={{
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                  }}
                >
                  <span
                    className={`h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-150 ${
                      isActive
                        ? "bg-signal shadow-[0_0_10px_rgba(143,247,224,0.9)] scale-125"
                        : isPast
                        ? "bg-signal/70"
                        : "bg-white/20 group-hover:bg-white/60"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute -bottom-2 z-10 translate-y-full whitespace-nowrap rounded border border-signal/20 bg-[#0D1220]/95 px-2 py-0.5 font-mono text-[10px] text-signal opacity-0 shadow-lg backdrop-blur-sm transition-all duration-150 group-hover:opacity-100 ${
                      i === 0
                        ? "left-0"
                        : i === JOURNEY.length - 1
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2"
                    }`}
                  >
                    {stop.title}
                  </span>
                  <span className="sr-only">{stop.title}</span>
                </a>
              );
            })}
          </div>

          {/* Mode actions & links */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Explore button */}
            <button
              onClick={() => setMode(isExploreMode ? "journey" : "explore")}
              className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                isExploreMode
                  ? "border-signal bg-signal/15 text-signal shadow-[0_0_12px_rgba(143,247,224,0.25)]"
                  : "border-white/10 bg-white/5 text-ink-dim hover:border-signal/40 hover:text-signal"
              }`}
            >
              {isExploreMode ? "Exit Flight" : "Free Flight"}
            </button>

            {/* Architecture button */}
            <button
              onClick={() => setMode(isNNMode ? "journey" : "architecture")}
              className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                isNNMode
                  ? "border-signal bg-signal/15 text-signal shadow-[0_0_12px_rgba(143,247,224,0.25)]"
                  : "border-white/10 bg-white/5 text-ink-dim hover:border-signal/40 hover:text-signal"
              }`}
            >
              {isNNMode ? "Exit NN" : "3D Network"}
            </button>

            {/* Movie mode toggle */}
            <button
              onClick={toggle}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                isPlaying
                  ? "border-signal bg-signal/15 text-signal shadow-[0_0_12px_rgba(143,247,224,0.25)]"
                  : "border-white/10 bg-white/5 text-ink-dim hover:border-signal/40 hover:text-signal"
              }`}
              title="Toggle cinematic auto-scroll"
            >
              {isPlaying ? (
                <>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Tour</span>
                </>
              )}
            </button>

            {/* PDF write-up link */}
            <a
              href="#read-pdf"
              onClick={(e) => handleScrollTo(e, "read-pdf")}
              className="hidden sm:inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-ink-dim transition-colors hover:border-white/30 hover:text-ink"
            >
              PDF
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Floating Exit Button during active free modes */}
      {(isModeActive || isPlaying) && (
        <button
          onClick={() => {
            if (isPlaying) stopMovie();
            if (isModeActive) setMode("journey");
          }}
          className="fixed right-6 top-6 z-[65] flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-void/80 text-ink-dim backdrop-blur-md transition-all hover:scale-105 hover:border-signal hover:text-signal active:scale-95"
          title="Exit to journey (Esc)"
          aria-label="Exit to journey"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Mode Controls HUD — Positioned at bottom-left without overlapping AudioToggle */}
      {isModeActive && (
        <motion.div
          className="fixed bottom-20 left-4 sm:bottom-6 sm:left-24 z-[55] flex flex-col gap-3 rounded-xl border border-white/10 bg-void/90 p-4 sm:p-5 backdrop-blur-xl font-mono text-xs shadow-2xl w-[calc(100vw-2rem)] sm:w-[280px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-semibold text-signal uppercase tracking-wider">
              {isNNMode ? "Architecture View" : "Terrain Flight"}
            </span>
            {isNNMode && (
              <button
                onClick={commandResetNNCamera}
                className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-ink-dim hover:bg-white/20 hover:text-ink transition-colors"
                title="Reset Camera View"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5 text-ink-dim">
            {isNNMode ? (
              <>
                <div className="flex justify-between">
                  <span className="text-ink">Drag</span>
                  <span className="text-ink-faint">Orbit rotate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">Right-drag / WASD</span>
                  <span className="text-ink-faint">Pan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">Pinch / Scroll</span>
                  <span className="text-ink-faint">Zoom</span>
                </div>
                <button
                  onClick={commandToggleTour}
                  className="mt-2 w-full rounded-lg border border-signal/30 bg-signal/10 py-1.5 font-mono text-[11px] font-semibold text-signal transition-colors hover:bg-signal/20 active:scale-95"
                >
                  Cinematic Tour
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-ink">Click + Drag</span>
                  <span className="text-ink-faint">Look around</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">W A S D</span>
                  <span className="text-ink-faint">Fly forward/back/strafe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink">R / F</span>
                  <span className="text-ink-faint">Ascend / Descend</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Countdown ring during reading dwell in Movie mode */}
      {isPlaying && <CountdownRing seconds={dwellSeconds} />}
    </>
  );
}
