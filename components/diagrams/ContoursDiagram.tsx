"use client";

import { motion } from "framer-motion";

const W = 300;
const H = 190;
const CX = W / 2;
const CY = H / 2;

function ContourSet({
  radii,
  color,
  label,
}: {
  radii: number[];
  color: string;
  label: string;
}) {
  return (
    <div className="flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {radii.map((r, i) => (
          <motion.ellipse
            key={r}
            cx={CX}
            cy={CY}
            rx={r}
            ry={r * 0.72}
            fill="none"
            stroke={color}
            strokeOpacity={0.85 - i * 0.1}
            strokeWidth={1.4}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: "easeOut" }}
          />
        ))}
        {/* gradient-direction arrows, pointing outward = direction of increasing loss */}
        {[0, 72, 144, 216, 288].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const r0 = radii[0] * 0.55;
          const r1 = radii[0] * 1.05;
          const x0 = CX + Math.cos(rad) * r0;
          const y0 = CY + Math.sin(rad) * r0 * 0.72;
          const x1 = CX + Math.cos(rad) * r1;
          const y1 = CY + Math.sin(rad) * r1 * 0.72;
          return (
            <motion.line
              key={deg}
              x1={x0}
              y1={y0}
              x2={x1}
              y2={y1}
              stroke="#8FF7E0"
              strokeWidth={1.2}
              markerEnd="url(#arrowhead)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.75 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.5 }}
            />
          );
        })}
        <circle cx={CX} cy={CY} r={2.5} fill="#EDEFF5" />
      </svg>
      <p className="text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        {label}
      </p>
    </div>
  );
}

export default function ContoursDiagram() {
  return (
    <div>
      <svg width="0" height="0">
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#8FF7E0" />
          </marker>
        </defs>
      </svg>
      <div className="flex flex-col sm:flex-row gap-8">
        <ContourSet radii={[14, 24, 34, 44, 54]} color="#F2542D" label="tight spacing · steep" />
        <ContourSet radii={[10, 32, 54, 76, 98]} color="#2E6FF2" label="wide spacing · gentle" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-dim">
        Contour spacing is inversely proportional to gradient magnitude: rings packed tightly
        together mean the loss changes fast over a short distance — steep, sharp terrain.
        Rings spread far apart mean the loss barely moves — flat, forgiving terrain.
      </p>
    </div>
  );
}
