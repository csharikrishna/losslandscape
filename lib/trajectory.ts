import * as THREE from "three";
import { JOURNEY, heightAt } from "./terrain-data";

const HOVER = 0.55; // how far above the literal terrain surface the path/camera glide

/** The main flythrough (hero → overlook) is choreographed to finish at 80% of
 *  total document scroll. The remaining 20% (concept grid, takeaways, PDF,
 *  footer) holds the camera at the final overlook waypoint — "parked,
 *  taking in the view" — while the reader finishes up. Both the camera rig
 *  and the trajectory reveal read this same constant so they never drift
 *  out of sync with each other. */
export const CAMERA_SCROLL_END = 0.8;

export function toCameraProgress(documentProgress: number): number {
  return Math.min(1, Math.max(0, documentProgress / CAMERA_SCROLL_END));
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
