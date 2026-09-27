"use client";

import { useEffect, useSyncExternalStore } from "react";
import { measureAnchors, stopParamAt, type Anchor } from "./journey-scroll";
import { getActiveStop, setJourneyTarget, subscribeActiveStop } from "./journey-state";

/**
 * Mount once at the root layout.
 * Pass enabled=false when a free-camera mode is open, preserving the journey position.
 */
export function useJourneyScrollMapper(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let anchors: Anchor[] = [];

    const update = () => {
      setJourneyTarget(stopParamAt(window.scrollY, anchors));
    };

    const remeasure = () => {
      anchors = measureAnchors();
      update();
    };

    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", remeasure);

    remeasure();

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", remeasure);
    };
  }, [enabled]);
}

export function useActiveStop(): number {
  return useSyncExternalStore(subscribeActiveStop, getActiveStop, () => 0);
}
