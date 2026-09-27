"use client";

import { useSyncExternalStore } from "react";

export type TierName = "minimal" | "low" | "medium" | "high";

export interface Tier {
  name: TierName;
  maxDpr: number;
  pixelBudget: number;
  postprocessing: boolean;
  bloomLevels: number;
  smaa: boolean;
  stars: number;
}

export const TIERS: Record<TierName, Tier> = {
  high: {
    name: "high",
    maxDpr: 1.5,
    pixelBudget: 8.3e6,
    postprocessing: true,
    bloomLevels: 8,
    smaa: true,
    stars: 1400,
  },
  medium: {
    name: "medium",
    maxDpr: 1.25,
    pixelBudget: 4.0e6,
    postprocessing: true,
    bloomLevels: 6,
    smaa: true,
    stars: 1000,
  },
  low: {
    name: "low",
    maxDpr: 1.0,
    pixelBudget: 2.0e6,
    postprocessing: true,
    bloomLevels: 4,
    smaa: false,
    stars: 600,
  },
  minimal: {
    name: "minimal",
    maxDpr: 1.0,
    pixelBudget: 1.2e6,
    postprocessing: false,
    bloomLevels: 0,
    smaa: false,
    stars: 0,
  },
};

const ORDER: TierName[] = ["minimal", "low", "medium", "high"];
let ceiling: TierName = "high";
let current: TierName = "medium";
let initialized = false;

const listeners = new Set<() => void>();

const emit = () => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.quality = current;
  }
  listeners.forEach((l) => l());
};

export const quality = {
  init() {
    if (initialized || typeof window === "undefined") return;
    initialized = true;

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };

    const isDataSaver = nav.connection?.saveData === true;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const lowMemory = (nav.deviceMemory ?? 8) <= 4;
    const lowCores = navigator.hardwareConcurrency <= 4;

    if (isDataSaver) {
      ceiling = "minimal";
    } else if (isTouch || lowMemory || lowCores) {
      ceiling = "low";
    } else {
      ceiling = "high";
    }

    current = ceiling;
    emit();
  },

  step(dir: 1 | -1) {
    const ceilingIndex = ORDER.indexOf(ceiling);
    const currentIndex = ORDER.indexOf(current);
    const targetIndex = Math.min(ceilingIndex, Math.max(0, currentIndex + dir));

    if (ORDER[targetIndex] !== current) {
      current = ORDER[targetIndex];
      emit();
    }
  },

  getTier(): Tier {
    return TIERS[current];
  },
};

export const useQuality = (): Tier => {
  const tierName = useSyncExternalStore<TierName>(
    (listener) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    () => current,
    () => "medium"
  );
  return TIERS[tierName];
};

/**
 * Calculates adaptive DPR respecting both maximum DPR and total pixel budget.
 * Prevents 4K screens from rendering 8.3M+ fragments on modest GPUs.
 */
export function dprFor(t: Tier): number {
  if (typeof window === "undefined") return 1;
  const screenPixels = window.innerWidth * window.innerHeight;
  const budgetDpr = Math.sqrt(t.pixelBudget / Math.max(1, screenPixels));
  const nativeDpr = window.devicePixelRatio || 1;
  return Math.max(0.75, Math.min(t.maxDpr, nativeDpr, budgetDpr));
}
