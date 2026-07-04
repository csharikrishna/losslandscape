"use client";

import { useState, useEffect, useRef } from "react";

export function useMovieMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  // Timestamp when scrolling should resume. If performance.now() < resumeTime, it pauses.
  const resumeTime = useRef(0);
  const seenPanels = useRef(new Set<Element>());
  const requestRef = useRef<number>();

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    
    if (isPlaying) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
      startScroll();
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.warn(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
      stopScroll();
    }

    return stopScroll;
  }, [isPlaying]);

  const startScroll = () => {
    let lastTime = performance.now();
    const speed = 70; // Pixels per second

    const loop = (time: number) => {
      if (!isPlayingRef.current) return;
      
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (time > resumeTime.current) {
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
          
          // Pause for 4.5 seconds to read
          resumeTime.current = performance.now() + 4500;
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
        // Add 5 more seconds to the pause timer
        resumeTime.current = Math.max(resumeTime.current, now) + 5000;
      }
    };

    const cancelOnInteract = (e: Event) => {
      if (!e.isTrusted) return;
      const target = e.target as HTMLElement;
      
      // If the user touches the text box, don't cancel Movie Mode — 
      // let the click handler extend the time instead.
      if (e.type === 'touchstart' && target.closest('.panel-glass')) {
        return;
      }
      
      setIsPlaying(false);
    };
    
    document.addEventListener('click', onPanelClick);
    window.addEventListener('wheel', cancelOnInteract, { passive: true });
    window.addEventListener('touchstart', cancelOnInteract, { passive: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('click', onPanelClick);
      window.removeEventListener('wheel', cancelOnInteract);
      window.removeEventListener('touchstart', cancelOnInteract);
    };
  }, [isPlaying]);

  return { isPlaying, setIsPlaying };
}
