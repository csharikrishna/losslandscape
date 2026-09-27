"use client";

import { motion } from "framer-motion";

const W = 360;
const H = 190;
const CX = W / 2;
const CY = H / 2;

export default function ContoursDiagram() {
  // Elongated concentric ellipses modeling an ill-conditioned ravine
  const ellipses = [
    { rx: 50, ry: 15, opacity: 0.85, color: "#8FF7E0" },
    { rx: 90, ry: 30, opacity: 0.65, color: "#5FE3C9" },
    { rx: 130, ry: 48, opacity: 0.45, color: "#2E6FF2" },
    { rx: 165, ry: 68, opacity: 0.25, color: "#F2542D" },
  ];

  // Zig-zag path of standard gradient descent across steep ravine walls
  const zigZagPath = `M ${CX - 145},${CY - 58} 
    L ${CX - 110},${CY + 45} 
    L ${CX - 75},${CY - 35} 
    L ${CX - 40},${CY + 25} 
    L ${CX - 10},${CY - 18} 
    L ${CX + 15},${CY + 12} 
    L ${CX + 35},${CY - 6} 
    L ${CX + 50},${CY}`;

  // Momentum / Adam path gliding down the corridor
  const momentumPath = `M ${CX - 145},${CY - 58} 
    Q ${CX - 90},${CY + 10} ${CX},${CY}`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {/* Ill-conditioned ravine contour lines */}
        {ellipses.map((e, i) => (
          <ellipse
            key={i}
            cx={CX}
            cy={CY}
            rx={e.rx}
            ry={e.ry}
            fill="none"
            stroke={e.color}
            strokeOpacity={e.opacity}
            strokeWidth={1.5}
          />
        ))}

        {/* Center minimum corridor marker */}
        <circle cx={CX} cy={CY} r={3} fill="#8FF7E0" />

        {/* Naive SGD zig-zag trajectory */}
        <motion.path
          d={zigZagPath}
          fill="none"
          stroke="#F2542D"
          strokeWidth={1.8}
          strokeDasharray="3 3"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />

        {/* Momentum / Adaptive trajectory */}
        <motion.path
          d={momentumPath}
          fill="none"
          stroke="#8FF7E0"
          strokeWidth={2.2}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
        />
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex items-center gap-4 text-ink-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#F2542D]" />
            <span>Naive SGD (zig-zagging across steep walls)</span>
          </span>
          <span className="flex items-center gap-1.5 text-signal">
            <span className="h-0.5 w-4 bg-[#8FF7E0]" />
            <span>With Momentum (damped corridor progress)</span>
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        In an anisotropic ravine, curvature across the valley is hundreds of times greater than
        along it. Gradients point almost perpendicular to the corridor floor. Without momentum or
        adaptive coordinate scaling, gradient descent ricochets between the steep valley walls
        instead of progressing smoothly down the low-loss corridor.
      </p>
    </div>
  );
}
