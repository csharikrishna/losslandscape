"use client";

import { Canvas } from "@react-three/fiber";
import { useJourneyScroll } from "@/lib/scroll-context";
import { usePrefersReducedMotion } from "@/lib/motion";
import Scene from "./Scene";

/**
 * The persistent, fixed-position 3D world. Every page section scrolls on top
 * of this single canvas — the terrain is never remounted or reset, which is
 * what makes the whole page read as one continuous flight rather than a
 * series of separate embedded 3D widgets.
 */
export default function CanvasStage() {
  const { smoothProgress, isExploreMode } = useJourneyScroll();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 50, near: 0.1, far: 400, position: [0, 30, -38] }}
        performance={{ min: 0.5 }}
      >
        <Scene progress={smoothProgress} motionScale={reducedMotion ? 0 : 1} isExploreMode={isExploreMode} />
      </Canvas>
    </div>
  );
}
