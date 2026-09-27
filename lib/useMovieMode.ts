"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRAVEL_S = 7;
const DWELL_S = 5;
const MAX_DT = 0.1;

export function measureReadingStops(): number[] {
  if (typeof window === "undefined" || typeof document === "undefined") return [];

  const vh = window.innerHeight;
  const max = Math.max(0, document.documentElement.scrollHeight - vh);

  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
  const stops = sections.map((el) => {
    const r = el.getBoundingClientRect();
    const centerY = r.top + window.scrollY + r.height / 2;
    return Math.min(max, Math.max(0, centerY - vh / 2));
  });

  return Array.from(new Set(stops)).sort((a, b) => a - b);
}

/**
 * Pure function: maps elapsed seconds and stop positions to the target scroll position.
 */
export function timelineY(elapsed: number, stops: number[]) {
  if (!stops || stops.length === 0) {
    return { y: 0, dwellLeft: 0, done: true };
  }

  const leg = TRAVEL_S + DWELL_S;
  const k = Math.floor(elapsed / leg);

  if (k >= stops.length - 1) {
    return { y: stops[stops.length - 1], dwellLeft: 0, done: true };
  }

  const inLeg = elapsed - k * leg;
  if (inLeg >= TRAVEL_S) {
    // Dwelling at section k + 1
    return { y: stops[k + 1], dwellLeft: leg - inLeg, done: false };
  }

  // Travelling from stops[k] to stops[k + 1] with smoothstep
  const t = inLeg / TRAVEL_S;
  const ease = t * t * (3 - 2 * t);
  const currentY = stops[k] + (stops[k + 1] - stops[k]) * ease;
  return { y: currentY, dwellLeft: 0, done: false };
}

export function useMovieMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [dwellSeconds, setDwellSeconds] = useState(0);
  const ownsFullscreen = useRef(false);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (ownsFullscreen.current && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    ownsFullscreen.current = false;
  }, []);

  const start = useCallback(() => {
    // Request fullscreen on user gesture if available
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(
        () => {
          ownsFullscreen.current = true;
        },
        () => {
          // Fullscreen rejected or unsupported
        }
      );
    }
    setIsPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  useEffect(() => {
    if (!isPlaying) return;

    const startY = window.scrollY;
    let stops = [startY, ...measureReadingStops().filter((y) => y > startY + 5)];
    let elapsed = 0;
    let last = performance.now();
    let written = Math.round(startY);
    let shownSecs = -1;
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;

      // Stop immediately if user explicitly scrolled away via mousewheel, touch, or keys
      if (Math.abs(window.scrollY - written) > 3) {
        stop();
        return;
      }

      elapsed += dt;
      const { y, dwellLeft, done } = timelineY(elapsed, stops);
      written = Math.round(y);
      window.scrollTo({ top: written, behavior: "instant" });

      const currentSecs = Math.ceil(dwellLeft);
      if (currentSecs !== shownSecs) {
        shownSecs = currentSecs;
        setDwellSeconds(currentSecs);
      }

      if (done) {
        stop();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      stops = [startY, ...measureReadingStops().filter((y) => y > startY + 5)];
    });
    ro.observe(document.body);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stop();
      }
    };

    window.addEventListener("keydown", onKey);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      setDwellSeconds(0);
    };
  }, [isPlaying, stop]);

  return {
    isPlaying,
    start,
    stop,
    toggle,
    dwellSeconds,
  };
}
