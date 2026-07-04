"use client";

import { motion } from "framer-motion";

const W = 300;
const H = 150;
const PAD = 26;
const CX = W / 2;
const CY = H / 2;

/** A downward-opening arc (this direction rolls the ball away — unstable). */
function hillPath() {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = -1 + (i / 40) * 2;
    const x = CX + t * (CX - PAD);
    const y = CY - (1 - t * t) * (CY - PAD) * 0.85;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/** An upward-opening arc (this direction rolls the ball back to center — stable). */
function valleyPath() {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = -1 + (i / 40) * 2;
    const x = CX + t * (CX - PAD);
    const y = CY + t * t * (CY - PAD) * 0.85;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function SaddleDiagram() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-elevation-high">
          Direction A — unstable
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
          <path d={hillPath()} fill="none" stroke="#F2542D" strokeWidth={2.5} />
          <motion.circle
            r={6}
            fill="#F2542D"
            initial={{ cx: CX, cy: CY - 2 }}
            animate={{
              cx: [CX, CX + 4, CX + 60, CX + 66],
              cy: [CY - 2, CY - 4, CY - 46, CY - 52],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              repeatDelay: 0.6,
              times: [0, 0.15, 0.85, 1],
              ease: "easeIn",
            }}
          />
          <circle cx={CX} cy={CY - 2} r={3} fill="#EDEFF5" />
        </svg>
        <p className="mt-2 text-xs text-ink-faint">
          Nudge it this way and it rolls away and keeps going — loss decreases without bound
          along this slice.
        </p>
      </div>

      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-elevation-low">
          Direction B — stable
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
          <path d={valleyPath()} fill="none" stroke="#2E6FF2" strokeWidth={2.5} />
          <motion.circle
            r={6}
            fill="#2E6FF2"
            initial={{ cx: CX - 60, cy: CY + 40 }}
            animate={{
              cx: [CX - 60, CX - 10, CX, CX],
              cy: [CY + 40, CY + 1, CY - 2, CY - 2],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              repeatDelay: 0.6,
              times: [0, 0.7, 0.85, 1],
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
          <circle cx={CX} cy={CY - 2} r={3} fill="#EDEFF5" />
        </svg>
        <p className="mt-2 text-xs text-ink-faint">
          Nudge it this way instead and it rolls straight back to center — a minimum, along
          this slice alone.
        </p>
      </div>
    </div>
  );
}
