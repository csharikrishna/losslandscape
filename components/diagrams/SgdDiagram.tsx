"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const W = 320;
const H = 190;
const CX = W / 2;
const CY = H / 2 + 6;

/** A small deterministic pseudo-random generator (no Math.random — keeps the
 *  path identical between server and client render, avoiding hydration
 *  mismatches) used only to shape the "noisy" SGD path below. */
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildSgdPath() {
  let x = -118;
  let y = -66;
  const pts: [number, number][] = [[x, y]];
  const steps = 26;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // drift toward the center, decaying step size, plus noisy jitter that
    // shrinks as we approach convergence — exactly SGD's qualitative shape.
    const pull = 0.34;
    x += (-x) * pull * 0.28 + (seeded(i) - 0.5) * 34 * (1 - t * 0.7);
    y += (-y) * pull * 0.28 + (seeded(i + 50) - 0.5) * 30 * (1 - t * 0.7);
    pts.push([x, y]);
  }
  return pts;
}

function buildGdPath() {
  const pts: [number, number][] = [];
  const steps = 14;
  let x = -118;
  let y = -66;
  for (let i = 0; i <= steps; i++) {
    pts.push([x, y]);
    x *= 0.74;
    y *= 0.74;
  }
  return pts;
}

function toSvg(pts: [number, number][]) {
  return pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${(CX + x).toFixed(1)},${(CY + y).toFixed(1)}`)
    .join(" ");
}

export default function SgdDiagram() {
  const sgdPts = useMemo(buildSgdPath, []);
  const gdPts = useMemo(buildGdPath, []);
  const sgdPath = useMemo(() => toSvg(sgdPts), [sgdPts]);
  const gdPath = useMemo(() => toSvg(gdPts), [gdPts]);

  const contourRadii = [20, 42, 66, 92, 120];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {contourRadii.map((r) => (
          <ellipse
            key={r}
            cx={CX}
            cy={CY}
            rx={r}
            ry={r * 0.62}
            fill="none"
            stroke="#1B2333"
            strokeWidth={1}
          />
        ))}

        <path d={gdPath} fill="none" stroke="#7B8299" strokeWidth={1.6} strokeDasharray="1 5" strokeLinecap="round" />

        <motion.path
          d={sgdPath}
          fill="none"
          stroke="#8FF7E0"
          strokeWidth={2.2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />
        <circle cx={CX} cy={CY} r={3} fill="#EDEFF5" />
      </svg>

      <div className="mt-3 flex items-center gap-5 font-mono text-[11px] text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-[2px] w-4 bg-signal" /> SGD (noisy)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-ink-faint" /> full-batch GD (smooth)
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        Mini-batch noise makes SGD bounce rather than glide — and that bouncing is not purely
        a cost. It acts like thermal energy in a physical system: it&apos;s what lets the optimizer
        hop out of narrow, sharp wells that a perfectly smooth descent would fall into and get
        stuck in, ultimately biasing SGD toward the wide, flat basins that generalize better.
      </p>
    </div>
  );
}
