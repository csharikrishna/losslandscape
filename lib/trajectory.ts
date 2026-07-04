import * as THREE from "three";
import { JOURNEY, heightAt } from "./terrain-data";

const HOVER = 0.9; // how far above the literal terrain surface the path/camera glide

/** The main flythrough (hero → overlook) is choreographed to finish at 80% of
 *  total document scroll. The remaining 20% (concept grid, takeaways, PDF,
 *  footer) holds the camera at the final overlook waypoint — "parked,
 *  taking in the view" — while the reader finishes up. Both the camera rig
 *  and the trajectory reveal read this same constant so they never drift
 *  out of sync with each other. */
export const CAMERA_SCROLL_END = 0.8;

// ---------------------------------------------------------------------------
// Section-aware progress mapping
// ---------------------------------------------------------------------------
// Every DOM section in page order, paired with the JOURNEY stop index it
// corresponds to (null = interstitial, no dedicated camera stop).  During
// interstitial sections the camera glides slowly from the previous stop
// toward the next — keeping the scene alive without racing ahead.

interface SectionMapping {
  sectionId: string;
  /** Index into JOURNEY[], or null for interstitial sections. */
  journeyIndex: number | null;
}

const SECTION_ORDER: SectionMapping[] = [
  { sectionId: "hero",       journeyIndex: 0 },   // hero
  { sectionId: "basics",     journeyIndex: 1 },   // basics / parameter space
  { sectionId: "sharp",      journeyIndex: 2 },   // sharp minimum
  { sectionId: "saddle",     journeyIndex: 3 },   // saddle point
  { sectionId: "plateau",    journeyIndex: 4 },   // plateau
  { sectionId: "cliff",      journeyIndex: 5 },   // cliff
  { sectionId: "ridge",      journeyIndex: 6 },   // ridge
  { sectionId: "ravine",     journeyIndex: 7 },   // ravine / contours
  { sectionId: "curvature",  journeyIndex: null }, // interstitial
  { sectionId: "flatmin",    journeyIndex: 8 },   // flat wide minimum
  { sectionId: "globalmin",  journeyIndex: 9 },   // global minimum
  { sectionId: "sgd",        journeyIndex: null }, // interstitial
  { sectionId: "overlook",   journeyIndex: 10 },  // overlook
  { sectionId: "concepts",   journeyIndex: null }, // interstitial (parked)
  { sectionId: "takeaways",  journeyIndex: null }, // interstitial (parked)
  { sectionId: "read-pdf",   journeyIndex: null }, // interstitial (parked)
];

const TOTAL_SECTIONS = SECTION_ORDER.length;

/**
 * Build a lookup: for each section slot (evenly spaced in scroll), what
 * camera-curve t should the camera be at?
 *
 * For JOURNEY-linked sections the answer is straightforward:
 *   t = journeyIndex / (JOURNEY.length - 1)
 *
 * For interstitial sections we linearly interpolate between the t values
 * of the previous and next JOURNEY-linked sections, with a bias toward
 * staying closer to the previous (so the camera "parks" rather than races).
 */
function buildProgressLUT(): { scrollFrac: number; cameraT: number }[] {
  const lut: { scrollFrac: number; cameraT: number }[] = [];
  const maxJourneyIdx = JOURNEY.length - 1;

  for (let i = 0; i < TOTAL_SECTIONS; i++) {
    const scrollFrac = i / (TOTAL_SECTIONS - 1);
    const mapping = SECTION_ORDER[i];

    if (mapping.journeyIndex !== null) {
      lut.push({ scrollFrac, cameraT: mapping.journeyIndex / maxJourneyIdx });
    } else {
      // Find previous and next journey-linked sections
      let prevT = 0;
      for (let j = i - 1; j >= 0; j--) {
        if (SECTION_ORDER[j].journeyIndex !== null) {
          prevT = SECTION_ORDER[j].journeyIndex! / maxJourneyIdx;
          break;
        }
      }
      let nextT = 1;
      for (let j = i + 1; j < TOTAL_SECTIONS; j++) {
        if (SECTION_ORDER[j].journeyIndex !== null) {
          nextT = SECTION_ORDER[j].journeyIndex! / maxJourneyIdx;
          break;
        }
      }

      // Find how far we are between prev and next journey sections
      let prevIdx = i - 1;
      while (prevIdx >= 0 && SECTION_ORDER[prevIdx].journeyIndex === null) prevIdx--;
      let nextIdx = i + 1;
      while (nextIdx < TOTAL_SECTIONS && SECTION_ORDER[nextIdx].journeyIndex === null) nextIdx++;

      const span = nextIdx - prevIdx;
      const offset = i - prevIdx;
      // Bias: only advance 30% of the gap during interstitials (slower glide)
      const frac = (offset / span) * 0.3;
      lut.push({ scrollFrac, cameraT: prevT + (nextT - prevT) * frac });
    }
  }

  return lut;
}

const PROGRESS_LUT = buildProgressLUT();

/**
 * Convert raw document scroll progress [0, 1] to camera-curve t [0, 1].
 * Uses a piecewise-linear interpolation through the section-aware LUT so
 * the camera stays at each feature while its panel is on screen.
 */
export function toCameraProgress(documentProgress: number): number {
  // Scale: the camera journey occupies the first CAMERA_SCROLL_END of the scroll
  const p = Math.min(1, Math.max(0, documentProgress / CAMERA_SCROLL_END));

  // Find the two LUT entries that bracket this scroll fraction
  if (p <= PROGRESS_LUT[0].scrollFrac) return PROGRESS_LUT[0].cameraT;
  if (p >= PROGRESS_LUT[PROGRESS_LUT.length - 1].scrollFrac) {
    return PROGRESS_LUT[PROGRESS_LUT.length - 1].cameraT;
  }

  for (let i = 0; i < PROGRESS_LUT.length - 1; i++) {
    const a = PROGRESS_LUT[i];
    const b = PROGRESS_LUT[i + 1];
    if (p >= a.scrollFrac && p <= b.scrollFrac) {
      const t = (p - a.scrollFrac) / (b.scrollFrac - a.scrollFrac);
      return a.cameraT + (b.cameraT - a.cameraT) * t;
    }
  }

  return p; // fallback
}

/** Builds the single Catmull-Rom curve that both the glowing trajectory line
 *  and the camera rig travel along. Built once (curves are pure math, no
 *  WebGL context required) and reused everywhere so "scroll progress" always
 *  means the same physical point in the landscape. */
export function buildTrajectoryCurve(): THREE.CatmullRomCurve3 {
  const points = JOURNEY.map((stop) => {
    const y = heightAt(stop.x, stop.z) + HOVER;
    return new THREE.Vector3(stop.x, y, stop.z);
  });
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35);
}

/** Arc-length-parametrized point + tangent at progress t ∈ [0, 1]. Using
 *  getPointAt (not getPoint) keeps travel speed visually constant even
 *  though the waypoints are unevenly spaced. */
export function sampleTrajectory(curve: THREE.CatmullRomCurve3, t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  const point = curve.getPointAt(clamped);
  const tangent = curve.getTangentAt(clamped);
  return { point, tangent };
}

/** Progress values [0..1] for each named stop, evenly spaced by index — this
 *  mirrors how the DOM sections are laid out (roughly equal scroll height
 *  each), so a stop's index fraction lines up with when its section is on
 *  screen. */
export function stopProgress(index: number): number {
  return index / (JOURNEY.length - 1);
}

export const JOURNEY_LENGTH = JOURNEY.length;
