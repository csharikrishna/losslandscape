// lib/journey.ts — DOM-safe journey constants. MUST NEVER IMPORT THREE.JS.
import { JOURNEY, heightAt, TERRAIN_BOUNDS, type JourneyStop } from "./terrain-data";

export { JOURNEY, heightAt, TERRAIN_BOUNDS, type JourneyStop };

export const TOTAL_STOPS = JOURNEY.length;
export const LAST_STOP = JOURNEY.length - 1;

/**
 * Normalized progress [0..1] for a stop index.
 */
export function stopProgress(index: number): number {
  return index / LAST_STOP;
}

/**
 * Sections that correspond directly to a waypoint in JOURNEY.
 * Interstitial sections (e.g. curvature, sgd, concepts, takeaways, read-pdf)
 * smoothly bridge the camera between the previous and next stops.
 */
export const STOP_SECTIONS = [
  ["hero", 0],
  ["basics", 1],
  ["sharp", 2],
  ["saddle", 3],
  ["plateau", 4],
  ["cliff", 5],
  ["ridge", 6],
  ["ravine", 7],
  ["flatmin", 8],
  ["globalmin", 9],
  ["overlook", 10],
] as const;

export type StopSectionId = (typeof STOP_SECTIONS)[number][0];
