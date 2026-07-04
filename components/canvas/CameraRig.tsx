"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { JOURNEY, heightAt } from "@/lib/terrain-data";
import { buildTrajectoryCurve, sampleTrajectory, toCameraProgress } from "@/lib/trajectory";

const LOOK_AHEAD = 0.025;

function buildCameraCurve(): THREE.CatmullRomCurve3 {
  const points = JOURNEY.map((stop) => {
    const groundY = heightAt(stop.x, stop.z);
    const x = stop.x + (stop.camSide ?? 0);
    const y = groundY + stop.camHeight;
    const z = stop.z - stop.camBack;
    return new THREE.Vector3(x, y, z);
  });
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.3);
}

export default function CameraRig({
  progress,
  motionScale = 1,
  isExploreMode = false,
}: {
  progress: MotionValue<number>;
  motionScale?: number;
  isExploreMode?: boolean;
}) {
  const cameraCurve = useMemo(() => buildCameraCurve(), []);
  const trajectoryCurve = useMemo(() => buildTrajectoryCurve(), []);

  const target = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const smoothTarget = useMemo(() => new THREE.Vector3(), []);
  const isInitialized = useMemo(() => ({ value: false }), []);
  
  // Track if we just came back from explore mode to smoothly lerp back
  const returningFromExplore = useRef(false);
  const wasExploreMode = useRef(isExploreMode);

  useFrame(({ camera, clock }) => {
    if (isExploreMode) {
      wasExploreMode.current = true;
      return; // Let FlyControls handle the camera
    }

    if (wasExploreMode.current && !isExploreMode) {
      returningFromExplore.current = true;
      wasExploreMode.current = false;
    }

    const p = toCameraProgress(progress.get());

    camPos.copy(cameraCurve.getPointAt(p));

    const t = clock.getElapsedTime();
    camPos.y += Math.sin(t * 0.35) * 0.07 * motionScale;
    camPos.x += Math.cos(t * 0.22) * 0.05 * motionScale;

    // Look at the trajectory point slightly ahead of the current position.
    const { point } = sampleTrajectory(trajectoryCurve, Math.min(1, p + LOOK_AHEAD));
    target.copy(point);
    target.y += 1.1;

    if (!isInitialized.value) {
      smoothTarget.copy(target);
      camera.position.copy(camPos);
      camera.lookAt(smoothTarget);
      isInitialized.value = true;
    } else if (returningFromExplore.current) {
      // Smoothly fly back from where the user was exploring to the scroll path
      camera.position.lerp(camPos, 0.05);
      
      // We need to lerp the camera's current look direction towards the path target
      // This is a bit tricky with quaternions, but we can just let lookAt handle it
      // if we lerp the target. We'll reuse smoothTarget.
      smoothTarget.lerp(target, 0.05);
      camera.lookAt(smoothTarget);

      // Check if we are close enough to snap back to normal
      if (camera.position.distanceTo(camPos) < 0.5) {
        returningFromExplore.current = false;
      }
    } else {
      // Normal on-rails movement
      camera.position.copy(camPos);
      smoothTarget.lerp(target, 0.12);
      camera.lookAt(smoothTarget);
    }
  });

  return null;
}
