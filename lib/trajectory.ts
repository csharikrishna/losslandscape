// lib/trajectory.ts — WebGL trajectory curve builder.
// WARNING: This file imports three.js and MUST ONLY be imported by canvas components,
// NEVER by DOM/layout components (to keep three.js out of the initial critical bundle).
import * as THREE from "three";
import { JOURNEY, heightAt } from "./journey";

const HOVER = 0.9; // distance above the terrain surface

let cachedCurve: THREE.CatmullRomCurve3 | null = null;

/**
 * Builds the Catmull-Rom curve for the optimization trajectory.
 * Cached so it is only computed once across the application lifecycle.
 */
export function buildTrajectoryCurve(): THREE.CatmullRomCurve3 {
  if (cachedCurve) return cachedCurve;

  // 1. Build a 2D guide curve for X and Z coordinates
  const xzPoints = JOURNEY.map((stop) => new THREE.Vector3(stop.x, 0, stop.z));
  const xzCurve = new THREE.CatmullRomCurve3(xzPoints, false, "catmullrom", 0.35);

  // 2. Sample densely so the line contours cleanly to the heightfield
  const DENSE_SAMPLES = 250;
  const densePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= DENSE_SAMPLES; i++) {
    const t = i / DENSE_SAMPLES;
    const pt = xzCurve.getPoint(t);
    const y = heightAt(pt.x, pt.z) + HOVER;
    densePoints.push(new THREE.Vector3(pt.x, y, pt.z));
  }

  // 3. Build the final 3D curve with gentle tension
  cachedCurve = new THREE.CatmullRomCurve3(densePoints, false, "catmullrom", 0.1);
  return cachedCurve;
}
