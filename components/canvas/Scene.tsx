"use client";

import { Suspense } from "react";
import { Stars, FlyControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { MotionValue } from "framer-motion";
import Terrain from "./Terrain";
import TrajectoryPath from "./TrajectoryPath";
import CameraRig from "./CameraRig";

export default function Scene({
  progress,
  motionScale,
  isExploreMode,
}: {
  progress: MotionValue<number>;
  motionScale: number;
  isExploreMode: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#05070C"]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 40, 15]} intensity={0.4} />

      <Stars radius={140} depth={60} count={1400} factor={2.4} saturation={0} fade speed={0.25} />

      <Suspense fallback={null}>
        <Terrain isExploreMode={isExploreMode} />
        <TrajectoryPath progress={progress} />
      </Suspense>

      <CameraRig progress={progress} motionScale={motionScale} isExploreMode={isExploreMode} />

      {isExploreMode && (
        <FlyControls movementSpeed={15} rollSpeed={0.5} dragToLook={true} />
      )}

      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.25}
          intensity={0.55}
          mipmapBlur
          radius={0.6}
        />
      </EffectComposer>
    </>
  );
}
