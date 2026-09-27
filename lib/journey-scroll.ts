// lib/journey-scroll.ts — pure scroll mapping functions. MUST NEVER IMPORT THREE.JS.
import { STOP_SECTIONS, LAST_STOP } from "./journey";

export interface Anchor {
  y: number;
  stop: number;
  id: string;
}

/**
 * Measures the scrollY at which each stop section's center aligns with the viewport center.
 * Only call this on layout change (ResizeObserver / resize), NEVER per frame.
 */
export function measureAnchors(): Anchor[] {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return [];
  }

  const vh = window.innerHeight;
  const maxY = Math.max(0, document.documentElement.scrollHeight - vh);
  const anchors: Anchor[] = [];

  for (const [id, stop] of STOP_SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const elementCenterY = r.top + window.scrollY + r.height / 2;
    const targetScrollY = Math.min(maxY, Math.max(0, elementCenterY - vh / 2));
    anchors.push({ y: targetScrollY, stop, id });
  }

  // Ensure anchors are sorted by y ascending
  anchors.sort((a, b) => a.y - b.y);

  return anchors;
}

const smootherstep = (t: number): number => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (6 * c - 15) + 10);
};

/**
 * Maps current scrollY to stop parameter u ∈ [0, LAST_STOP].
 * Interpolates smoothly between measured section anchors so the camera and marker
 * dwell gracefully on each feature when its content panel is centered.
 */
export function stopParamAt(scrollY: number, anchors: readonly Anchor[]): number {
  if (!anchors || anchors.length === 0) return 0;
  if (scrollY <= anchors[0].y) return anchors[0].stop;

  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1];
    const curr = anchors[i];
    if (scrollY < curr.y) {
      const span = curr.y - prev.y;
      if (span <= 0) return curr.stop;
      const t = (scrollY - prev.y) / span;
      return prev.stop + (curr.stop - prev.stop) * smootherstep(t);
    }
  }

  // Beyond the last stop section (e.g. during concepts, takeaways, PDF, footer)
  // park the camera at the overlook vista
  return LAST_STOP;
}
