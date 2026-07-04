/**
 * A small, dependency-free, deterministic 2D value-noise implementation.
 *
 * We hand-roll this instead of pulling in `simplex-noise` for two reasons:
 * 1. It's genuinely simple (hash → bilinear interpolate → smoothstep) and
 *    keeping it in-repo means the terrain is 100% reproducible with zero
 *    external inputs.
 * 2. One fewer dependency to version-match against three.js/R3F releases.
 *
 * This is "value noise," not true Perlin/Simplex noise — visually similar
 * for our purposes (rolling, organic terrain roughness) and much shorter
 * to implement correctly.
 */

/** Deterministic pseudo-random hash in [-1, 1] for an integer lattice point. */
function hash2(ix: number, iz: number, seed: number): number {
  let h = ix * 374761393 + iz * 668265263 + seed * 2147483647;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  // Map the 32-bit int to [-1, 1]
  return ((h & 0x7fffffff) / 0x7fffffff) * 2 - 1;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Single-octave value noise, roughly in [-1, 1], sampled at continuous (x, z). */
export function valueNoise2D(x: number, z: number, seed = 0): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const x1 = x0 + 1;
  const z1 = z0 + 1;

  const sx = smoothstep(x - x0);
  const sz = smoothstep(z - z0);

  const n00 = hash2(x0, z0, seed);
  const n10 = hash2(x1, z0, seed);
  const n01 = hash2(x0, z1, seed);
  const n11 = hash2(x1, z1, seed);

  const nx0 = lerp(n00, n10, sx);
  const nx1 = lerp(n01, n11, sx);

  return lerp(nx0, nx1, sz);
}

export interface FbmOptions {
  octaves?: number;
  lacunarity?: number; // frequency multiplier per octave
  gain?: number; // amplitude multiplier per octave
  seed?: number;
}

/** Fractal Brownian Motion: layered octaves of value noise for natural-looking roughness. */
export function fbm2D(
  x: number,
  z: number,
  { octaves = 5, lacunarity = 2.0, gain = 0.5, seed = 0 }: FbmOptions = {}
): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let norm = 0;

  for (let o = 0; o < octaves; o++) {
    sum += amplitude * valueNoise2D(x * frequency, z * frequency, seed + o * 101);
    norm += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return sum / norm; // roughly [-1, 1]
}
