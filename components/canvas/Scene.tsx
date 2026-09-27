"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { Stars } from "@react-three/drei";
import Terrain from "./Terrain";
import TrajectoryPath from "./TrajectoryPath";
import CameraRig from "./CameraRig";
import JourneyDriver from "./JourneyDriver";
import ExploreControls from "./modes/ExploreControls";
import Effects from "./Effects";
import { useMode } from "@/lib/mode-store";
import { useQuality } from "@/lib/quality";
import { usePrefersReducedMotion } from "@/lib/motion";

// Lazy-load Architecture mode so neural network geometry, troika, and fonts only load when requested
const ArchitectureMode = lazy(() => import("./modes/ArchitectureMode"));

export default function Scene() {
  const mode = useMode();
  const tier = useQuality();
  const reducedMotion = usePrefersReducedMotion();

  // Keep track of whether Architecture mode has been visited at least once
  const [archLoaded, setArchLoaded] = useState(false);
  useEffect(() => {
    if (mode === "architecture") {
      setArchLoaded(true);
    }
  }, [mode]);

  return (
    <>
      <color attach="background" args={["#05070C"]} />

      {/* Frame-rate independent journey progression and camera rig */}
      <JourneyDriver lambda={reducedMotion ? 12 : 5} />
      <CameraRig
        enabled={mode === "journey"}
        motionScale={reducedMotion ? 0 : 1}
      />

      {/* Background starfield — gated by quality tier and reduced motion */}
      {tier.stars > 0 && (
        <Stars
          radius={140}
          depth={60}
          count={tier.stars}
          factor={2.4}
          saturation={0}
          fade
          speed={reducedMotion ? 0 : 0.25}
        />
      )}

      {/* Terrain & trajectory stay mounted to prevent GPU memory leaks and re-compilations */}
      <group visible={mode !== "architecture"}>
        <Terrain isExploreMode={mode === "explore"} />
        <TrajectoryPath />
      </group>

      {/* Free explore flight controls */}
      {mode === "explore" && <ExploreControls />}

      {/* Neural network architecture view */}
      {archLoaded && (
        <Suspense fallback={null}>
          <ArchitectureMode active={mode === "architecture"} />
        </Suspense>
      )}

      {/* Adaptive postprocessing tier */}
      <Effects tier={tier} />
    </>
  );
}
