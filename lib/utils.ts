export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Remaps t from [inMin, inMax] to [0, 1], clamped — the workhorse for
 *  turning "overall scroll progress" into "this section's local 0→1." */
export function remap01(t: number, inMin: number, inMax: number): number {
  if (inMax === inMin) return 0;
  return clamp((t - inMin) / (inMax - inMin), 0, 1);
}
