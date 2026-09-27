"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type * as THREE from "three";
import Scene from "./Scene";
import { useQuality, dprFor, quality } from "@/lib/quality";

export default function CanvasStage() {
  const tier = useQuality();
  const [dpr, setDpr] = useState(1);
  const [contextLost, setContextLost] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    quality.init();
    const updateDpr = () => setDpr(dprFor(tier));
    updateDpr();

    window.addEventListener("resize", updateDpr);
    return () => window.removeEventListener("resize", updateDpr);
  }, [tier]);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
      console.warn("WebGL context lost. Attempting recovery...");
    };
    const onRestored = () => {
      setContextLost(false);
      console.info("WebGL context restored successfully.");
    };

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0" aria-hidden="true">
      {contextLost ? (
        <div className="absolute inset-0 flex items-center justify-center bg-void/90 z-20">
          <div className="text-center font-mono text-xs text-ink-dim">
            <p>GPU context momentarily reset. Restoring scene…</p>
          </div>
        </div>
      ) : null}

      <Canvas
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
        }}
        camera={{ fov: 50, near: 0.1, far: 400, position: [0, 30, -38] }}
        onCreated={handleCreated}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => quality.step(-1)}
          onIncline={() => quality.step(1)}
          onFallback={() => quality.step(-1)}
        />
        <Scene />
      </Canvas>
    </div>
  );
}
