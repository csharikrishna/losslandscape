// lib/journey-state.ts — shared, render-free journey state. MUST NEVER IMPORT THREE.JS.
import { LAST_STOP } from "./journey";

export interface JourneyState {
  target: number;
  smoothed: number;
}

export const journey: JourneyState = {
  target: 0,
  smoothed: 0,
};

let activeStop = 0;
const stopListeners = new Set<() => void>();

export function setJourneyTarget(u: number) {
  const clamped = Math.max(0, Math.min(LAST_STOP, u));
  journey.target = clamped;
  const k = Math.round(clamped);
  if (k !== activeStop) {
    activeStop = k;
    stopListeners.forEach((fn) => fn());
  }
}

export function subscribeActiveStop(listener: () => void) {
  stopListeners.add(listener);
  return () => {
    stopListeners.delete(listener);
  };
}

export function getActiveStop(): number {
  return activeStop;
}
