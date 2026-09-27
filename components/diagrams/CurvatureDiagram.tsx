"use client";

import { useRef, useState } from "react";

function Gyroscope() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [rotY, setRotY] = useState(-18);
  const [rotX, setRotX] = useState(10);
  const dragRef = useRef<{ x: number; y: number; rotY: number; rotX: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setHasInteracted(true);
    dragRef.current = { x: e.clientX, y: e.clientY, rotY, rotX };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setRotY(dragRef.current.rotY + dx * 0.5);
    setRotX(Math.max(-70, Math.min(70, dragRef.current.rotX - dy * 0.4)));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already lost
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const STEP = 15;
    if (e.key === "ArrowLeft") {
      setRotY((r) => r - STEP);
      setHasInteracted(true);
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      setRotY((r) => r + STEP);
      setHasInteracted(true);
      e.preventDefault();
    }
    if (e.key === "ArrowUp") {
      setRotX((r) => Math.max(-70, Math.min(70, r + STEP)));
      setHasInteracted(true);
      e.preventDefault();
    }
    if (e.key === "ArrowDown") {
      setRotX((r) => Math.max(-70, Math.min(70, r - STEP)));
      setHasInteracted(true);
      e.preventDefault();
    }
  };

  return (
    <div
      role="application"
      aria-label="3D Gyroscope visualizer for curvature axes. Use arrow keys to rotate."
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative mx-auto flex h-48 w-48 cursor-grab select-none items-center justify-center active:cursor-grabbing focus:outline-none focus:ring-1 focus:ring-signal/40 rounded-full"
      style={{ perspective: 600 }}
    >
      <div
        className="relative h-40 w-40 transition-transform duration-75"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        {/* Ring 1 (X) */}
        <div
          className="absolute inset-0 rounded-full border-2 border-elevation-high/60 shadow-[0_0_15px_rgba(242,84,45,0.2)]"
          style={{ transform: "rotateY(90deg)" }}
        />
        {/* Ring 2 (Y) */}
        <div
          className="absolute inset-0 rounded-full border-2 border-elevation-mid/60 shadow-[0_0_15px_rgba(242,193,78,0.2)]"
          style={{ transform: "rotateX(90deg)" }}
        />
        {/* Ring 3 (Z) */}
        <div className="absolute inset-0 rounded-full border-2 border-elevation-low/60 shadow-[0_0_15px_rgba(46,111,242,0.2)]" />

        {/* Center core */}
        <div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_10px_#8FF7E0]"
          style={{ transform: "translateZ(0px)" }}
        />
      </div>

      {!hasInteracted && (
        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-void/80 px-2 py-0.5 font-mono text-[10px] text-ink-faint border border-white/5">
          drag or arrows
        </div>
      )}
    </div>
  );
}

function EigenSpectrum() {
  const W = 300;
  const H = 130;
  const base = H - 22;

  // Real Hessian spectrum shape: a dense bulk near zero (flat directions)
  // followed by a long tail with isolated outlier eigenvalues
  const bulkPath = `M18,${base}
    C 35,${base} 45,${base - 8} 55,${base - 65}
    C 65,${base - 105} 75,${base - 105} 85,${base - 65}
    C 95,${base - 20} 115,${base - 6} 140,${base} Z`;

  const outlierPath = `M 215,${base}
    C 225,${base} 230,${base - 16} 235,${base - 16}
    C 240,${base - 16} 245,${base} 255,${base} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 26}`} className="w-full overflow-visible">
      {/* Baseline */}
      <line x1={16} y1={base} x2={W - 14} y2={base} stroke="#1B2333" strokeWidth={1} />

      {/* Dense bulk near zero */}
      <path d={bulkPath} fill="#2E6FF2" fillOpacity={0.15} stroke="#2E6FF2" strokeWidth={1.8} />

      {/* Outlier spike */}
      <path d={outlierPath} fill="#F2542D" fillOpacity={0.2} stroke="#F2542D" strokeWidth={1.8} />

      {/* Bulk label */}
      <line x1={70} y1={base + 4} x2={70} y2={base - 105} stroke="#2E6FF2" strokeDasharray="2 3" strokeWidth={1} />
      <text x={70} y={base + 16} textAnchor="middle" className="fill-elevation-low font-mono text-[8.5px]">
        bulk near zero (~95% of axes)
      </text>

      {/* Outliers label */}
      <line x1={235} y1={base + 4} x2={235} y2={base - 16} stroke="#F2542D" strokeDasharray="2 3" strokeWidth={1} />
      <text x={235} y={base + 16} textAnchor="middle" className="fill-elevation-high font-mono text-[8.5px]">
        isolated outliers (sharp axes)
      </text>

      <text x={W / 2} y={H + 22} textAnchor="middle" className="fill-ink-faint font-mono text-[9px]">
        eigenvalue distribution of ∇²L(θ)
      </text>
    </svg>
  );
}

export default function CurvatureDiagram() {
  return (
    <div>
      <Gyroscope />
      <p className="mt-1 text-center text-xs text-ink-faint">drag or arrow keys to rotate</p>
      <div className="mt-6">
        <EigenSpectrum />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        The Hessian ∇²L(θ) has one eigenvalue per direction you could slice the landscape.
        In real trained networks that spectrum is famously lopsided: a dense bulk of small,
        near-zero eigenvalues (directions the loss barely reacts to) and a sparse handful of
        large outliers (directions it reacts to violently) — most of parameter space is flat,
        a little of it is razor sharp.
      </p>
    </div>
  );
}
