"use client";

import { motion } from "framer-motion";

const W = 320;
const H = 140;
const PAD = 18;

// A hand-placed sequence of (x, loss) control points — deterministic, not
// random, so the shape is art-directed to clearly show "several okay
// minima, one clearly-lowest minimum" rather than genuine noise.
const POINTS: [number, number][] = [
  [0, 0.72],
  [0.08, 0.5],
  [0.16, 0.58],
  [0.24, 0.34],
  [0.3, 0.4],
  [0.38, 0.22],
  [0.46, 0.3],
  [0.54, 0.6],
  [0.62, 0.46],
  [0.7, 0.5],
  [0.78, 0.16],
  [0.86, 0.28],
  [0.94, 0.42],
  [1, 0.5],
];

function toSvg([x, y]: [number, number]) {
  const px = PAD + x * (W - PAD * 2);
  const py = PAD + y * (H - PAD * 2);
  return { px, py };
}

function buildPath() {
  return POINTS.map(([x, y], i) => {
    const { px, py } = toSvg([x, y]);
    return `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(" ");
}

// Local minima: points that are lower than both neighbors.
const localMinimaIdx = POINTS.map((_, i) => i).filter((i) => {
  if (i === 0 || i === POINTS.length - 1) return false;
  return POINTS[i][1] < POINTS[i - 1][1] && POINTS[i][1] < POINTS[i + 1][1];
});
const globalIdx = localMinimaIdx.reduce((best, i) =>
  POINTS[i][1] < POINTS[best][1] ? i : best
, localMinimaIdx[0]);

export default function MinimaPathDiagram() {
  const path = buildPath();

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#1B2333" strokeWidth={1} />
        <motion.path
          d={path}
          fill="none"
          stroke="#8FF7E0"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        {localMinimaIdx.map((i) => {
          const { px, py } = toSvg(POINTS[i]);
          const isGlobal = i === globalIdx;
          return (
            <g key={i}>
              <circle cx={px} cy={py} r={isGlobal ? 6 : 4} fill={isGlobal ? "#2E6FF2" : "#7B8299"} />
              {isGlobal && <circle cx={px} cy={py} r={11} fill="#2E6FF2" fillOpacity={0.18} />}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-5 font-mono text-[10.5px] text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink-faint" /> local minimum
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-elevation-low" /> global (lowest found)
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        SGD never sees this whole curve at once — it only ever sees the noisy signal directly
        under its feet, one step at a time, in a space with millions of dimensions this 1D
        slice can&apos;t begin to show. &quot;Global minimum&quot; is really shorthand for{" "}
        <em>the best one we found</em>; in practice nobody can certify a minimum is the true
        global optimum, and — per the flat-vs-sharp argument — it usually doesn&apos;t matter,
        because a good flat minimum generalizes about as well as the true optimum would.
      </p>
    </div>
  );
}
