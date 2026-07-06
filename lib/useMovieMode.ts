"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const SPEED_CRUISE = 120;  // px/s between features
const SPEED_NEAR_PANEL = 50; // px/s approaching a panel
const PROXIMITY_PX = 300;  // how close to a panel to start slowing

export function useMovieMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  // Timestamp when scrolling should resume. If performance.now() < resumeTime, it pauses.
  const resumeTime = useRef(0);
  const seenPanels = useRef(new Set<Element>());
  const requestRef = useRef<number>();
  // Expose the remaining pause time so a countdown ring can read it
  const [pauseRemaining, setPauseRemaining] = useState(0);

  const setPlayingWrapper = useCallback((play: boolean | ((prev: boolean) => boolean)) => {
    if (typeof play === 'function') {
      setIsPlaying((prev) => {
        const next = play(prev);
        if (next) {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
        return next;
      });
    } else {
      if (play) {
        setIsPlaying(true);
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        setIsPlaying(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
  }, []);

  const toggle = useCallback(() => {
    setPlayingWrapper((prev) => !prev);
  }, [setPlayingWrapper]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    
    if (isPlaying) {
      // Reset seen panels so a re-play re-pauses at each section
      seenPanels.current.clear();
      startScroll();
    } else {
      stopScroll();
      setPauseRemaining(0);
    }

    return stopScroll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const getSpeedForCurrentPosition = (): number => {
    // Check proximity to the nearest upcoming panel
    const panels = document.querySelectorAll('.panel-glass');
    let minDist = Infinity;

    for (const panel of panels) {
      const rect = panel.getBoundingClientRect();
      // Distance from the panel's top to the viewport center
      const dist = rect.top - window.innerHeight * 0.5;
      // Only consider panels below/near the viewport center (upcoming)
      if (dist > -100 && dist < minDist) {
        minDist = dist;
      }
    }

    if (minDist < PROXIMITY_PX) {
      // Smoothly interpolate between cruise and slow speed
      const t = Math.max(0, minDist / PROXIMITY_PX);
      return SPEED_NEAR_PANEL + (SPEED_CRUISE - SPEED_NEAR_PANEL) * t;
    }

    return SPEED_CRUISE;
  };

  const startScroll = () => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      if (!isPlayingRef.current) return;
      
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const remaining = resumeTime.current - time;
      if (remaining > 0) {
        // Still paused — update the countdown
        setPauseRemaining(Math.ceil(remaining / 1000));
      } else {
        setPauseRemaining(0);
        const speed = getSpeedForCurrentPosition();
        window.scrollBy({
          top: speed * dt,
          left: 0,
          behavior: 'instant'
        });
      }

      requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);
  };

  const stopScroll = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !seenPanels.current.has(entry.target)) {
          seenPanels.current.add(entry.target);
          
          // Pause for 5 seconds to read
          resumeTime.current = performance.now() + 5000;
        }
      }
    }, {
      root: null,
      rootMargin: "-10% 0px -10% 0px", 
      threshold: 1
    });

    document.querySelectorAll('.panel-glass').forEach(el => observer.observe(el));

    // Handle tapping on a text box to extend reading time
    const onPanelClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.panel-glass')) {
        const now = performance.now();
        resumeTime.current = Math.max(resumeTime.current, now) + 5000;
      }
    };

    const cancelOnInteract = (e: Event) => {
      if (!e.isTrusted) return;
      const target = e.target as HTMLElement;
      
      if (e.type === 'touchstart' && target.closest('.panel-glass')) {
        return;
      }
      
      setIsPlaying(false);
    };

    // Keyboard: Space to toggle Movie Mode
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        toggle();
      }
    };
    
    document.addEventListener('click', onPanelClick);
    window.addEventListener('wheel', cancelOnInteract, { passive: true });
    window.addEventListener('touchstart', cancelOnInteract, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', onPanelClick);
      window.removeEventListener('wheel', cancelOnInteract);
      window.removeEventListener('touchstart', cancelOnInteract);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isPlaying, toggle]);

  // Global keyboard: Space to start Movie Mode even when not playing
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isPlayingRef.current) {
        e.preventDefault();
        setIsPlaying(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return { isPlaying, setIsPlaying: setPlayingWrapper, toggle, pauseRemaining };
}
