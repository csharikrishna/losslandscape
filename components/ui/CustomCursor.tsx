"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Non-intrusive ambient cursor follower that smoothly trails the pointer.
 * Respects touch devices, reduced motion, and automatically pauses its rAF loop when idle.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isMoving = useRef(false);
  const rafId = useRef<number>(0);
  const isHovering = useRef(false);

  useEffect(() => {
    // Disable on touch devices or if reduced motion is requested
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch || reducedMotion) return;

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      if (!isMoving.current) {
        isMoving.current = true;
        loop();
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const interactive = !!target.closest(
        "a, button, [role='button'], input, textarea, select, .math-tag-interactive"
      );

      if (interactive !== isHovering.current) {
        isHovering.current = interactive;
        if (ringRef.current) {
          if (interactive) {
            ringRef.current.classList.add("is-hovering");
          } else {
            ringRef.current.classList.remove("is-hovering");
          }
        }
      }
    };

    const loop = () => {
      const dx = mouse.current.x - ringPos.current.x;
      const dy = mouse.current.y - ringPos.current.y;

      ringPos.current.x += dx * 0.12;
      ringPos.current.y += dy * 0.12;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // If the ring is close enough to target, stop the rAF loop to save CPU
      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
        isMoving.current = false;
        cancelAnimationFrame(rafId.current);
        return;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, [reducedMotion]);

  if (!mounted || reducedMotion) return null;

  return <div ref={ringRef} className="custom-cursor-glass opacity-70" />;
}
