"use client";

import { useMemo, useState } from "react";

/**
 * Two loss curves, same depth at the bottom, different curvature (H).
 * loss(ε) ≈ L₀ + ½ · H · ε²   — the textbook second-order (Hessian) expansion
 * around a minimum. Dragging the slider moves an identical ε on both curves
 * at once, so the reader feels, directly, why "narrow" punishes the exact
 * same nudge far more than "wide" does.
 */

const WIDTH = 320;
const HEIGHT = 168;
const PAD = 28;

function curvePath(H: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const eps = -1 + (i / 60) * 2; // -1..1
    const loss = 0.5 * H * eps * eps;
    const x = PAD + ((eps + 1) / 2) * (WIDTH - PAD * 2);
    const y = HEIGHT - PAD - loss * (HEIGHT - PAD * 2 - 6);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${Math.max(6, y).toFixed(2)}`);
  }
  return pts.join(" ");
}

function pointOnCurve(H: number, eps: number) {
  const loss = 0.5 * H * eps * eps;
  const x = PAD + ((eps + 1) / 2) * (WIDTH - PAD * 2);
  const y = HEIGHT - PAD - loss * (HEIGHT - PAD * 2 - 6);
  return { x, y: Math.max(6, y), loss };
}

function MiniWell({
  title,
  H,
  eps,
  color,
}: {
  title: string;
  H: number;
  eps: number;
  color: string;
}) {
  const path = useMemo(() => curvePath(H), [H]);
  const p = pointOnCurve(H, eps);

  return (
    <div className="flex-1">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          {title}
        </span>
        <span className="font-mono text-[11px] text-ink-dim">
          L ≈ {p.loss.toFixed(3)}
        </span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full overflow-visible">
        <line
          x1={PAD}
          y1={HEIGHT - PAD}
          x2={WIDTH - PAD}
          y2={HEIGHT - PAD}
          stroke="#1B2333"
          strokeWidth={1}
        />
        <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <line
          x1={p.x}
          y1={HEIGHT - PAD}
          x2={p.x}
          y2={p.y}
          stroke={color}
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle cx={p.x} cy={p.y} r={5.5} fill={color} />
        <circle cx={p.x} cy={p.y} r={9} fill={color} fillOpacity={0.18} />
      </svg>
    </div>
  );
}

export default function SharpFlatDiagram() {
  const [eps, setEps] = useState(0.42);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6">
        <MiniWell title="Sharp minimum · H = 14" H={14} eps={eps} color="#F2542D" />
        <MiniWell title="Flat minimum · H = 1.2" H={1.2} eps={eps} color="#2E6FF2" />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-ink-faint">
          <span>perturbation ε</span>
          <span className="text-signal">{eps.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={eps}
          onChange={(e) => setEps(parseFloat(e.target.value))}
          className="w-full accent-signal"
          aria-label="Perturbation magnitude epsilon, applied to both minima at once"
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-dim">
        Both points start at the same loss. Drag the slider: the{" "}
        <span className="text-elevation-high">sharp</span> well&apos;s loss rockets up almost
        immediately, while the <span className="text-elevation-low">flat</span> well barely
        notices the same nudge — because real-world inputs are never bit-for-bit identical
        to training data, that difference <em>is</em> the generalization gap.
      </p>
    </div>
  );
}
