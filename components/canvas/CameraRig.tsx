"use client";

import { useMemo } from "react";
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
}: {
  progress: MotionValue<number>;
  motionScale?: number;
}) {
  const cameraCurve = useMemo(() => buildCameraCurve(), []);
  const trajectoryCurve = useMemo(() => buildTrajectoryCurve(), []);

  const target = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  // Smooth the lookAt target to prevent snapping
  const smoothTarget = useMemo(() => new THREE.Vector3(), []);
  const isInitialized = useMemo(() => ({ value: false }), []);

  useFrame(({ camera, clock }) => {
    const p = toCameraProgress(progress.get());

    camPos.copy(cameraCurve.getPointAt(p));

    // A very subtle idle sway so the camera never feels perfectly locked —
    // reduced amplitude for less jitter during transitions.
    const t = clock.getElapsedTime();
    camPos.y += Math.sin(t * 0.35) * 0.07 * motionScale;
    camPos.x += Math.cos(t * 0.22) * 0.05 * motionScale;

    camera.position.copy(camPos);

    // Look at the trajectory point slightly ahead of the current position.
    const { point } = sampleTrajectory(trajectoryCurve, Math.min(1, p + LOOK_AHEAD));
    target.copy(point);
    target.y += 1.1;

    // Smooth the lookAt target with lerp to prevent jarring snaps
    if (!isInitialized.value) {
      smoothTarget.copy(target);
      isInitialized.value = true;
    } else {
      smoothTarget.lerp(target, 0.12);
    }

    camera.lookAt(smoothTarget);
  });

  return null;
}
