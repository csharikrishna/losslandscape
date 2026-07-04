import { fbm2D } from "./noise";

/**
 * TERRAIN COORDINATE SYSTEM
 * -------------------------
 * X: lateral spread of the landscape, roughly [-60, 60].
 * Z: the "journey axis." The camera travels from Z=0 (hero) to Z≈140
 *    (closing vista) as the reader scrolls. Every section of the page,
 *    every camera waypoint, and every terrain feature below is placed
 *    on this same axis — one coordinate system driving three different
 *    parts of the UI (mesh shape, camera path, trajectory line), so the
 *    narrative and the geometry can never drift apart.
 * Y: elevation === loss. Low (blue) is good, high (red) is bad, exactly
 *    like the reference infographic's color legend.
 */

export type FeatureKind =
  | "well" // a bowl: sharp (small radius, deep) or flat (large radius, shallow)
  | "saddle" // down in one direction, up in the other
  | "plateau" // near-zero local gradient, flattened toward a target level
  | "cliff" // a smoothed step: sudden elevation change across a short span
  | "ridge"; // an elongated wall (positive amp) or trench/ravine (negative amp)

export interface TerrainFeature {
  id: string;
  kind: FeatureKind;
  x: number;
  z: number;
  /** primary radius (controls falloff / width) */
  radius: number;
  /** secondary radius for anisotropic features (ridge/ravine "length") */
  radiusLong?: number;
  /** magnitude; sign matters (negative = depression, positive = rise) */
  amplitude: number;
  /** rotation in radians, used by saddle + ridge orientation */
  rotation?: number;
  /** axis a cliff's step runs across ("x" or "z") */
  axis?: "x" | "z";
  /** absolute height a plateau flattens toward */
  plateauLevel?: number;
}

/** A stop on the reader's journey. Not every waypoint has a terrain feature
 *  (the hero and the closing vista are camera-only), but every terrain
 *  feature that matters to the narrative has a waypoint. */
export interface JourneyStop {
  id: string;
  title: string;
  eyebrow: string;
  x: number;
  z: number;
  /** camera height above this point's local terrain */
  camHeight: number;
  /** camera distance behind (along -Z) this point, i.e. how the shot is framed */
  camBack: number;
  /** lateral camera offset, for shots that peek in from the side */
  camSide?: number;
  featureId?: string; // links to TerrainFeature.id, if any
}

// ---------------------------------------------------------------------------
// The journey: hero → math → sharp min → saddle → plateau → cliff → ridge →
// ravine → flat wide minimum → global minimum → overlook.
// ---------------------------------------------------------------------------

export const JOURNEY: JourneyStop[] = [
  {
    id: "hero",
    title: "The Loss Landscape",
    eyebrow: "Begin the descent",
    x: 0,
    z: -4,
    camHeight: 30,
    camBack: 34,
  },
  {
    id: "basics",
    title: "Parameter space",
    eyebrow: "01 · Foundations",
    x: 4,
    z: 14,
    camHeight: 17,
    camBack: 20,
  },
  {
    id: "sharp",
    title: "Sharp minimum",
    eyebrow: "02 · High curvature",
    x: -15,
    z: 30,
    camHeight: 10,
    camBack: 17,
    camSide: -6,
    featureId: "sharp-well",
  },
  {
    id: "saddle",
    title: "Saddle point",
    eyebrow: "03 · Down one way, up the other",
    x: 2,
    z: 46,
    camHeight: 11,
    camBack: 16,
    featureId: "saddle-1",
  },
  {
    id: "plateau",
    title: "Plateau",
    eyebrow: "04 · Where gradients go quiet",
    x: 16,
    z: 58,
    camHeight: 13,
    camBack: 17,
    camSide: 5,
    featureId: "plateau-1",
  },
  {
    id: "cliff",
    title: "Cliff",
    eyebrow: "05 · A sudden change in loss",
    x: -12,
    z: 70,
    camHeight: 14,
    camBack: 18,
    camSide: -4,
    featureId: "cliff-1",
  },
  {
    id: "ridge",
    title: "Ridge",
    eyebrow: "06 · A barrier between basins",
    x: 16,
    z: 82,
    camHeight: 15,
    camBack: 18,
    camSide: 6,
    featureId: "ridge-1",
  },
  {
    id: "ravine",
    title: "Valley · Ravine",
    eyebrow: "07 · The path of least loss",
    x: 0,
    z: 96,
    camHeight: 12,
    camBack: 19,
    featureId: "ravine-1",
  },
  {
    id: "flatmin",
    title: "Flat, wide minimum",
    eyebrow: "08 · Why flatness generalizes",
    x: -9,
    z: 114,
    camHeight: 11,
    camBack: 18,
    camSide: -3,
    featureId: "flat-well",
  },
  {
    id: "globalmin",
    title: "Global minimum",
    eyebrow: "09 · The lowest loss we can find",
    x: 11,
    z: 130,
    camHeight: 10,
    camBack: 16,
    camSide: 3,
    featureId: "global-well",
  },
  {
    id: "overlook",
    title: "The whole range",
    eyebrow: "10 · Look back at the route",
    x: 4,
    z: 146,
    camHeight: 46,
    camBack: 46,
  },
];

// ---------------------------------------------------------------------------
// Terrain features (the geometry behind each named waypoint), plus a
// scattering of un-labeled local minima for texture — every good landscape
// has minima nobody names.
// ---------------------------------------------------------------------------

export const FEATURES: TerrainFeature[] = [
  { id: "sharp-well", kind: "well", x: -15, z: 30, radius: 3.6, amplitude: -14 },
  { id: "saddle-1", kind: "saddle", x: 2, z: 46, radius: 10, amplitude: 6.5, rotation: 0.55 },
  {
    id: "plateau-1",
    kind: "plateau",
    x: 16,
    z: 58,
    radius: 12,
    amplitude: 0,
    plateauLevel: 2.4,
  },
  { id: "cliff-1", kind: "cliff", x: -12, z: 70, radius: 7, amplitude: 13, axis: "x" },
  {
    id: "ridge-1",
    kind: "ridge",
    x: 16,
    z: 82,
    radius: 3.4,
    radiusLong: 15,
    amplitude: 12,
    rotation: 0.15,
  },
  {
    id: "ravine-1",
    kind: "ridge",
    x: 0,
    z: 98,
    radius: 4.4,
    radiusLong: 24,
    amplitude: -8.5,
    rotation: 0.06,
  },
  { id: "flat-well", kind: "well", x: -9, z: 114, radius: 15, amplitude: -10.5 },
  { id: "global-well", kind: "well", x: 11, z: 130, radius: 8.5, amplitude: -17 },

  // Unlabeled local minima, scattered off the main path for texture.
  { id: "local-1", kind: "well", x: -42, z: 52, radius: 5, amplitude: -6 },
  { id: "local-2", kind: "well", x: 46, z: 22, radius: 4.2, amplitude: -5.2 },
  { id: "local-3", kind: "well", x: -16, z: 88, radius: 4, amplitude: -4.5 },
  { id: "local-4", kind: "well", x: 40, z: 118, radius: 5.5, amplitude: -6.5 },
];

// ---------------------------------------------------------------------------
// Height field
// ---------------------------------------------------------------------------

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/** Smoothstep with explicit edges (GLSL-style), used for masks and cliffs. */
function smoothstepEdge(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function wellContribution(f: TerrainFeature, x: number, z: number): number {
  const dx = x - f.x;
  const dz = z - f.z;
  const d2 = dx * dx + dz * dz;
  return f.amplitude * Math.exp(-d2 / (2 * f.radius * f.radius));
}

function saddleContribution(f: TerrainFeature, x: number, z: number): number {
  const dx = x - f.x;
  const dz = z - f.z;
  const rot = f.rotation ?? 0;
  const u = dx * Math.cos(rot) + dz * Math.sin(rot);
  const v = -dx * Math.sin(rot) + dz * Math.cos(rot);
  const envelope = Math.exp(-(dx * dx + dz * dz) / (2 * f.radius * f.radius));
  return (f.amplitude * (u * u - v * v) * envelope) / (f.radius * f.radius);
}

function cliffContribution(f: TerrainFeature, x: number, z: number): number {
  const axis = f.axis ?? "x";
  const along = axis === "x" ? x - f.x : z - f.z;
  const perp = axis === "x" ? z - f.z : x - f.x;
  const step = smoothstepEdge(-f.radius * 0.5, f.radius * 0.5, along);
  const envelope = Math.exp(-(perp * perp) / (2 * f.radius * f.radius));
  return f.amplitude * step * envelope;
}

function ridgeContribution(f: TerrainFeature, x: number, z: number): number {
  const dx = x - f.x;
  const dz = z - f.z;
  const rot = f.rotation ?? 0;
  const along = dx * Math.sin(rot) + dz * Math.cos(rot);
  const across = dx * Math.cos(rot) - dz * Math.sin(rot);
  const sigmaLong = f.radiusLong ?? f.radius * 3;
  return (
    f.amplitude *
    Math.exp(-(across * across) / (2 * f.radius * f.radius) - (along * along) / (2 * sigmaLong * sigmaLong))
  );
}

/** Base rolling terrain: two fbm octasets at different scales, plus a gentle
 *  downhill bias along the journey axis so the whole range trends lower as
 *  you travel deeper in — "descending into the landscape." */
function baseTerrain(x: number, z: number): number {
  const large = fbm2D(x * 0.014, z * 0.014, { octaves: 4, seed: 11 }) * 5.2;
  const small = fbm2D(x * 0.06, z * 0.06, { octaves: 4, seed: 47 }) * 1.6;
  const slope = -z * 0.018;
  return large + small + slope + 4.5;
}

/** The full height field at a point, in world units. This is called once per
 *  vertex when building the terrain geometry (see Terrain.tsx) — not per
 *  frame — so it can stay simple and readable rather than shader-optimal. */
export function heightAt(x: number, z: number): number {
  let h = baseTerrain(x, z);

  for (const f of FEATURES) {
    switch (f.kind) {
      case "well":
        h += wellContribution(f, x, z);
        break;
      case "saddle":
        h += saddleContribution(f, x, z);
        break;
      case "cliff":
        h += cliffContribution(f, x, z);
        break;
      case "ridge":
        h += ridgeContribution(f, x, z);
        break;
      default:
        break;
    }
  }

  // Plateaus flatten *after* everything else has been summed, blending the
  // computed height toward a fixed target level near the feature's center.
  for (const f of FEATURES) {
    if (f.kind === "plateau" && f.plateauLevel !== undefined) {
      const dx = x - f.x;
      const dz = z - f.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      const mask = 1 - smoothstepEdge(f.radius * 0.55, f.radius, d);
      h = h * (1 - mask) + f.plateauLevel * mask;
    }
  }

  return h;
}

export const TERRAIN_BOUNDS = {
  minX: -64,
  maxX: 64,
  minZ: -16,
  maxZ: 150,
};

export function findStop(id: string): JourneyStop {
  const stop = JOURNEY.find((s) => s.id === id);
  if (!stop) throw new Error(`Unknown journey stop: ${id}`);
  return stop;
}
