"use client";

import { Suspense } from "react";
import { Stars, FlyControls, Environment, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { MotionValue } from "framer-motion";
import Terrain from "./Terrain";
import TrajectoryPath from "./TrajectoryPath";
import CameraRig from "./CameraRig";
import NeuralNetwork from "./NeuralNetwork";
import { useJourneyScroll } from "@/lib/scroll-context";

import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function KeyboardPanner({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl> }) {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!controlsRef.current) return;
    const speed = 0.5;
    let right = 0;
    let up = 0;

    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) right -= speed;
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) right += speed;
    if (keys.current["KeyW"] || keys.current["ArrowUp"]) up += speed;
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) up -= speed;

    if (right !== 0 || up !== 0) {
      const vRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const vUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      const movement = vRight.multiplyScalar(right).add(vUp.multiplyScalar(up));

      camera.position.add(movement);
      controlsRef.current.target.add(movement);
      controlsRef.current.update();
    }
  });

  return null;
}

function CinematicTour({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl> }) {
  const { camera } = useThree();
  const [isTouring, setIsTouring] = useState(false);
  const progress = useRef(0);

  useEffect(() => {
    const handleStart = () => {
      setIsTouring(true);
      progress.current = 0;
    };
    const handleStop = () => setIsTouring(false);
    
    window.addEventListener("start-cinematic-tour", handleStart);
    window.addEventListener("reset-nn-camera", handleStop);
    window.addEventListener("pointerdown", handleStop);
    
    return () => {
      window.removeEventListener("start-cinematic-tour", handleStart);
      window.removeEventListener("reset-nn-camera", handleStop);
      window.removeEventListener("pointerdown", handleStop);
    };
  }, []);

  useFrame((state, delta) => {
    if (!isTouring || !controlsRef.current) return;
    
    progress.current += delta * 0.08; // 12 second tour
    
    if (progress.current > 1) {
      setIsTouring(false);
      progress.current = 0;
      // Reset view at the end
      window.dispatchEvent(new Event("reset-nn-camera"));
      return;
    }
    
    const t = progress.current;
    const ease = (t: number) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    const e = ease(t);
    
    const px = THREE.MathUtils.lerp(-90, 80, e);
    const py = THREE.MathUtils.lerp(15, 2, e) + Math.sin(e * Math.PI * 2) * 12;
    const pz = THREE.MathUtils.lerp(60, 20, e) + Math.cos(e * Math.PI * 2) * 15;
    
    camera.position.set(px, py, pz);
    
    const tx = THREE.MathUtils.lerp(-40, 60, Math.min(e + 0.1, 1)); 
    const ty = Math.sin(e * Math.PI * 4) * 3;
    
    camera.lookAt(tx, ty, 0);
    controlsRef.current.target.set(tx, ty, 0);
    controlsRef.current.update();
  });

  return null;
}

function NNCameraSetup({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl> }) {
  const { camera } = useThree();
  useEffect(() => {
    // Initial position
    camera.position.set(20, 25, 90);
    camera.lookAt(10, 0, 0);

    const handleReset = () => {
      camera.position.set(20, 25, 90);
      if (controlsRef.current) {
        controlsRef.current.target.set(10, 0, 0);
        controlsRef.current.update();
      }
    };

    window.addEventListener("reset-nn-camera", handleReset);
    return () => window.removeEventListener("reset-nn-camera", handleReset);
  }, [camera, controlsRef]);
  return null;
}

export default function Scene({
  progress,
  motionScale,
  isExploreMode: propExploreMode,
}: {
  progress: MotionValue<number>;
  motionScale: number;
  isExploreMode: boolean;
}) {
  const { isExploreMode, isNNMode } = useJourneyScroll();
  const orbitRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <color attach="background" args={["#05070C"]} />

      <CameraRig progress={progress} motionScale={motionScale} isExploreMode={isExploreMode || isNNMode} />
      <Environment preset="city" />
      <directionalLight position={[10, 20, 5]} intensity={1.5} />
      <ambientLight intensity={0.2} />

      <Stars radius={140} depth={60} count={1400} factor={2.4} saturation={0} fade speed={0.25} />

      <Suspense fallback={null}>
        {!isNNMode && (
          <>
            <Terrain isExploreMode={isExploreMode} />
            <TrajectoryPath progress={progress} />
          </>
        )}
        {isNNMode && (
          <>
            <NeuralNetwork />
            <NNCameraSetup controlsRef={orbitRef} />
          </>
        )}
      </Suspense>

      {isExploreMode && !isNNMode && (
        <FlyControls movementSpeed={15} rollSpeed={0.5} dragToLook={true} />
      )}

      {isNNMode && (
        <>
          <OrbitControls 
            ref={orbitRef}
            target={[10, 0, 0]} 
            enableDamping 
            dampingFactor={0.05} 
            minDistance={10} 
            maxDistance={150} 
            makeDefault 
          />
          <KeyboardPanner controlsRef={orbitRef} />
          <CinematicTour controlsRef={orbitRef} />
        </>
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
