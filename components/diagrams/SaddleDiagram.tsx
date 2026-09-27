"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion";

const W = 300;
const H = 150;
const PAD = 26;
const CX = W / 2;
const CY = H / 2;

// SVG Y grows downwards:
// +t^2 bends downwards (∩ hill: maximum at t=0)
// -t^2 bends upwards   (∪ valley: minimum at t=0)
// Both cross-sections share the saddle point at (CX, CY).
const K = (CY - PAD) * 0.85;
const xAt = (t: number) => CX + t * (CX - PAD);
const hillY = (t: number) => CY + t * t * K;
const valleyY = (t: number) => CY - t * t * K;

function buildCurve(yFn: (t: number) => number) {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = -1 + (i / 40) * 2;
    const x = xAt(t);
    const y = yFn(t);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

const hillPathD = buildCurve(hillY);
const valleyPathD = buildCurve(valleyY);

export default function SaddleDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.3 });
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = isInView && !reducedMotion;

  // Unstable ball starts on the saddle point (CX, CY) and rolls downhill away
  const unstableFrames = {
    cx: [xAt(0), xAt(0.08), xAt(0.55), xAt(0.72)],
    cy: [hillY(0), hillY(0.08), hillY(0.55), hillY(0.72)],
    opacity: [1, 1, 1, 0],
  };

  // Stable ball starts up the valley wall and rolls down into the saddle minimum (CX, CY)
  const stableFrames = {
    cx: [xAt(-0.65), xAt(-0.2), xAt(0), xAt(0)],
    cy: [valleyY(-0.65), valleyY(-0.2), valleyY(0), valleyY(0)],
    opacity: [1, 1, 1, 1],
  };

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-elevation-high">
          Direction A — unstable
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
          <path d={hillPathD} fill="none" stroke="#F2542D" strokeWidth={2.5} />
          {shouldAnimate ? (
            <motion.circle
              r={5.5}
              fill="#F2542D"
              initial={{ cx: xAt(0), cy: hillY(0), opacity: 1 }}
              animate={unstableFrames}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 0.6,
                times: [0, 0.2, 0.8, 1],
                ease: "easeIn",
              }}
            />
          ) : (
            <circle cx={xAt(0)} cy={hillY(0)} r={5.5} fill="#F2542D" />
          )}
          {/* Saddle point marker */}
          <circle cx={CX} cy={CY} r={3} fill="#EDEFF5" />
        </svg>
        <p className="mt-2 text-xs text-ink-faint">
          Nudge it this way and it rolls away and keeps going — loss decreases along this slice.
        </p>
      </div>

      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-elevation-low">
          Direction B — stable
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
          <path d={valleyPathD} fill="none" stroke="#2E6FF2" strokeWidth={2.5} />
          {shouldAnimate ? (
            <motion.circle
              r={5.5}
              fill="#2E6FF2"
              initial={{ cx: xAt(-0.65), cy: valleyY(-0.65), opacity: 1 }}
              animate={stableFrames}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 0.6,
                times: [0, 0.6, 0.85, 1],
                ease: "easeOut",
              }}
            />
          ) : (
            <circle cx={CX} cy={CY} r={5.5} fill="#2E6FF2" />
          )}
          {/* Saddle point marker */}
          <circle cx={CX} cy={CY} r={3} fill="#EDEFF5" />
        </svg>
        <p className="mt-2 text-xs text-ink-faint">
          Nudge it this way instead and it rolls straight back to center — a minimum along this slice alone.
        </p>
      </div>
    </div>
  );
}
