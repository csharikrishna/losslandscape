"use client";

import { useRef, useState } from "react";

function Gyroscope() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [rotY, setRotY] = useState(-18);
  const [rotX, setRotX] = useState(10);
  const dragRef = useRef<{ x: number; y: number; rotY: number; rotX: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    setHasInteracted(true);
    dragRef.current = { x: e.clientX, y: e.clientY, rotY, rotX };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setRotY(dragRef.current.rotY + dx * 0.5);
    setRotX(Math.max(-70, Math.min(70, dragRef.current.rotX - dy * 0.4)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
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
      className="relative mx-auto h-[190px] w-[190px] cursor-grab touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal active:cursor-grabbing rounded-full"
      style={{ perspective: "700px" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      role="slider"
      aria-label="3D diagram of Hessian curvature directions. Use arrow keys or drag to rotate."
      aria-valuemin={-70}
      aria-valuemax={70}
      aria-valuenow={rotX}
      tabIndex={0}
    >
      <div
        className={!hasInteracted ? "h-full w-full animate-[spin-slow_16s_linear_infinite]" : "h-full w-full"}
        style={{
          transformStyle: "preserve-3d",
          transform: hasInteracted ? `rotateX(${rotX}deg) rotateY(${rotY}deg)` : undefined,
        }}
      >
        <div
          className="absolute inset-0 rounded-full border-2 border-elevation-low/80"
          style={{ transformStyle: "preserve-3d" }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-elevation-mid/80"
          style={{ transform: "rotateX(62deg)" }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-elevation-high/80"
          style={{ transform: "rotateY(62deg) rotateZ(18deg)" }}
        />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
      </div>
    </div>
  );
}

function EigenSpectrum() {
  const W = 300;
  const H = 130;
  const base = H - 22;

  // Hand-shaped density: a tall spike near zero (bulk of "flat" directions)
  // with a long, thin tail toward large eigenvalues — this is the real,
  // widely-observed shape of a trained network's Hessian spectrum.
  const path = `M18,${base}
    C 40,${base} 55,${base - 8} 70,${base - 55}
    C 82,${base - 100} 92,${base - 108} 104,${base - 70}
    C 118,${base - 30} 140,${base - 14} 175,${base - 8}
    C 220,${base - 2} 250,${base - 1} ${W - 16},${base}`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 26}`} className="w-full overflow-visible">
      <line x1={16} y1={base} x2={W - 14} y2={base} stroke="#1B2333" strokeWidth={1} />
      <path d={path} fill="none" stroke="#8FF7E0" strokeWidth={2} />
      <path d={`${path} L${W - 16},${base} L18,${base} Z`} fill="#8FF7E0" fillOpacity={0.08} />

      <line x1={70} y1={base + 4} x2={70} y2={base - 55} stroke="#2E6FF2" strokeDasharray="2 3" strokeWidth={1} />
      <text x={70} y={base + 16} textAnchor="middle" className="fill-elevation-low font-mono text-[8.5px]">
        many small
      </text>

      <line x1={104} y1={base + 4} x2={104} y2={base - 70} stroke="#F2C14E" strokeDasharray="2 3" strokeWidth={1} />
      <text x={112} y={base + 16} textAnchor="middle" className="fill-elevation-mid font-mono text-[8.5px]">
        bulk
      </text>

      <line x1={230} y1={base + 4} x2={230} y2={base - 6} stroke="#F2542D" strokeDasharray="2 3" strokeWidth={1} />
      <text x={222} y={base + 16} textAnchor="middle" className="fill-elevation-high font-mono text-[8.5px]">
        few large
      </text>

      <text x={W / 2} y={H + 22} textAnchor="middle" className="fill-ink-faint font-mono text-[9px]">
        eigenvalue of ∇²L(θ) — log scale
      </text>
    </svg>
  );
}

export default function CurvatureDiagram() {
  return (
    <div>
      <Gyroscope />
      <p className="mt-1 text-center text-xs text-ink-faint">drag to rotate</p>
      <div className="mt-6">
        <EigenSpectrum />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        The Hessian ∇²L(θ) has one eigenvalue per direction you could slice the landscape.
        In real trained networks that spectrum is famously lopsided: a dense bulk of small,
        near-zero eigenvalues (directions the loss barely reacts to) and a sparse handful of
        large ones (directions it reacts to violently) — most of parameter space is flat,
        a little of it is razor sharp.
      </p>
    </div>
  );
}
