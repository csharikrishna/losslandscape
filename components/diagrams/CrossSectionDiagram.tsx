"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const W = 300;
const TOP = 18;
const BOTTOM = 118;

type Variant = "plateau" | "cliff" | "ridge";

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Elevation in [0,1] (1 = highest / most loss) for a given variant at x∈[-1,1]. */
function elevation(variant: Variant, x: number): number {
  if (variant === "plateau") {
    const rise = smoothstep(-1, -0.35, x);
    const fall = 1 - smoothstep(0.35, 1, x);
    return 0.18 + 0.42 * Math.min(rise, fall);
  }
  if (variant === "cliff") {
    return 0.78 - 0.6 * smoothstep(-0.14, 0.1, x);
  }
  // ridge
  const bump = Math.exp(-(x * x) / (2 * 0.13 * 0.13));
  return 0.2 + 0.68 * bump;
}

function toXY(x: number, variant: Variant) {
  const px = W / 2 + x * (W / 2 - 20);
  const e = elevation(variant, x);
  const py = BOTTOM - e * (BOTTOM - TOP);
  return { px, py, e };
}

function buildPath(variant: Variant) {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = -1 + (i / 60) * 2;
    const { px, py } = toXY(x, variant);
    pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pts.join(" ");
}

const COPY: Record<Variant, { color: string; caption: string }> = {
  plateau: {
    color: "#F2C14E",
    caption:
      "Gradients here are close to zero in every direction — the optimizer has almost nothing to follow. Progress stalls unless momentum or an adaptive step size is carrying it through.",
  },
  cliff: {
    color: "#F2542D",
    caption:
      "A short run, a violent change in loss. The gradient norm right at the edge can be huge — one ordinary-sized step can hurl the parameters somewhere entirely different. Gradient clipping exists specifically for this.",
  },
  ridge: {
    color: "#2E6FF2",
    caption:
      "A wall of high loss separating two otherwise-reasonable basins. Crossing it requires either a large, well-aimed step, or accepting a temporarily worse loss — many optimizers simply never cross, and settle in whichever basin they started nearest to.",
  },
};

export default function CrossSectionDiagram({ variant }: { variant: Variant }) {
  const path = useMemo(() => buildPath(variant), [variant]);
  const { color, caption } = COPY[variant];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${BOTTOM + 14}`} className="w-full overflow-visible">
        <line x1={16} y1={BOTTOM} x2={W - 16} y2={BOTTOM} stroke="#1B2333" strokeWidth={1} />
        <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />

        {variant === "plateau" && (
          <motion.circle
            r={5.5}
            fill={color}
            cx={toXY(0, variant).px}
            cy={toXY(0, variant).py}
            initial={{ opacity: 1 }}
            animate={{ cx: [toXY(0, variant).px, toXY(0, variant).px + 6, toXY(0, variant).px - 4, toXY(0, variant).px] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {variant === "cliff" && (
          <CliffBall color={color} />
        )}

        {variant === "ridge" && <RidgeBall color={color} />}
      </svg>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">{caption}</p>
    </div>
  );
}

function CliffBall({ color }: { color: string }) {
  const xs = [-0.85, -0.05, 0.32];
  const points = xs.map((x) => toXY(x, "cliff"));
  return (
    <motion.circle
      r={5.5}
      fill={color}
      initial={{ cx: points[0].px, cy: points[0].py, opacity: 1 }}
      animate={{
        cx: [points[0].px, points[1].px, points[2].px],
        cy: [points[0].py, points[1].py, points[2].py + 34],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6, times: [0, 0.62, 1], ease: "easeIn" }}
    />
  );
}

function RidgeBall({ color }: { color: string }) {
  const xs = [-0.82, -0.2, -0.82];
  const points = xs.map((x) => toXY(x, "ridge"));
  return (
    <motion.circle
      r={5.5}
      fill={color}
      initial={{ cx: points[0].px, cy: points[0].py }}
      animate={{
        cx: points.map((p) => p.px),
        cy: points.map((p) => p.py),
      }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
