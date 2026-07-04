"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { JOURNEY, heightAt } from "@/lib/terrain-data";
import { buildTrajectoryCurve, sampleTrajectory, toCameraProgress } from "@/lib/trajectory";

const LOOK_AHEAD = 0.035;

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

  useFrame(({ camera, clock }) => {
    const p = toCameraProgress(progress.get());

    camPos.copy(cameraCurve.getPointAt(p));

    // A very small idle sway so the camera never feels perfectly locked to
    // the scrollbar — reduced to near-zero when the user prefers less motion.
    const t = clock.getElapsedTime();
    camPos.y += Math.sin(t * 0.45) * 0.12 * motionScale;
    camPos.x += Math.cos(t * 0.3) * 0.1 * motionScale;

    camera.position.copy(camPos);

    const { point } = sampleTrajectory(trajectoryCurve, Math.min(1, p + LOOK_AHEAD));
    target.copy(point);
    target.y += 1.1;
    camera.lookAt(target);
  });

  return null;
}
