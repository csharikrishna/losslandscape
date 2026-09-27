"use client";

import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import NeuralNetwork from "../NeuralNetwork";
import { onResetNNCamera, onToggleTour } from "@/lib/mode-store";

function KeyboardPanner({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl> }) {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if an input is focused
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const clampedDt = Math.min(delta, 0.1);
    const speed = 30 * clampedDt;
    let right = 0;
    let up = 0;

    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) right -= speed;
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) right += speed;
    if (keys.current["KeyW"] || keys.current["ArrowUp"]) up += speed;
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) up += speed;

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

    const unsubTour = onToggleTour(() => {
      setIsTouring((prev) => {
        if (!prev) progress.current = 0;
        return !prev;
      });
    });
    const unsubReset = onResetNNCamera(handleStop);

    window.addEventListener("pointerdown", handleStop);
    return () => {
      unsubTour();
      unsubReset();
      window.removeEventListener("pointerdown", handleStop);
    };
  }, []);

  useFrame((_, delta) => {
    if (!isTouring || !controlsRef.current) return;

    progress.current += Math.min(delta, 0.1) * 0.08; // ~12 second tour

    if (progress.current > 1) {
      setIsTouring(false);
      progress.current = 0;
      return;
    }

    const t = progress.current;
    const ease = (val: number) =>
      val < 0.5 ? 4 * val * val * val : (val - 1) * (2 * val - 2) * (2 * val - 2) + 1;
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
    camera.position.set(20, 25, 90);
    camera.lookAt(10, 0, 0);

    const handleReset = () => {
      camera.position.set(20, 25, 90);
      if (controlsRef.current) {
        controlsRef.current.target.set(10, 0, 0);
        controlsRef.current.update();
      }
    };

    const unsub = onResetNNCamera(handleReset);
    return unsub;
  }, [camera, controlsRef]);

  return null;
}

export default function ArchitectureMode({ active }: { active: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <group visible={active}>
        <NeuralNetwork />
      </group>
      {active && (
        <>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={[10, 0, 0]}
            enableDamping
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={150}
          />
          <NNCameraSetup controlsRef={controlsRef} />
          <KeyboardPanner controlsRef={controlsRef} />
          <CinematicTour controlsRef={controlsRef} />
        </>
      )}
    </>
  );
}
