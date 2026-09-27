"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JOURNEY, heightAt, LAST_STOP } from "@/lib/journey";
import { buildTrajectoryCurve } from "@/lib/trajectory";
import { journey } from "@/lib/journey-state";

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

interface CameraRigProps {
  enabled?: boolean;
  motionScale?: number;
}

export default function CameraRig({
  enabled = true,
  motionScale = 1,
}: CameraRigProps) {
  const cameraCurve = useMemo(() => buildCameraCurve(), []);
  const trajectoryCurve = useMemo(() => buildTrajectoryCurve(), []);

  const camPos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const smoothLook = useMemo(() => new THREE.Vector3(), []);
  const isInitialized = useRef(false);
  const returning = useRef(false);
  const wasEnabled = useRef(enabled);

  useFrame(({ camera, clock }, delta) => {
    if (!enabled) {
      wasEnabled.current = false;
      return;
    }

    const dt = Math.min(delta, 0.1);

    if (!wasEnabled.current && enabled) {
      returning.current = true;
      wasEnabled.current = true;
    }

    const u = journey.smoothed;
    const t = Math.max(0, Math.min(1, u / LAST_STOP));

    cameraCurve.getPoint(t, camPos);
    trajectoryCurve.getPoint(Math.min(1, (u + 0.25) / LAST_STOP), look);
    look.y += 1.1;

    // Subtle atmospheric sway
    const time = clock.getElapsedTime();
    camPos.y += Math.sin(time * 0.35) * 0.07 * motionScale;
    camPos.x += Math.cos(time * 0.22) * 0.05 * motionScale;

    if (!isInitialized.current) {
      smoothLook.copy(look);
      camera.position.copy(camPos);
      camera.lookAt(smoothLook);
      isInitialized.current = true;
      return;
    }

    if (returning.current) {
      // Smoothly fly back after Explore or Architecture mode with frame-rate independent exp
      camera.position.lerp(camPos, 1 - Math.exp(-3.5 * dt));
      smoothLook.lerp(look, 1 - Math.exp(-4 * dt));
      camera.lookAt(smoothLook);

      if (camera.position.distanceToSquared(camPos) < 0.05) {
        returning.current = false;
      }
    } else {
      camera.position.copy(camPos);
      smoothLook.lerp(look, 1 - Math.exp(-8 * dt));
      camera.lookAt(smoothLook);
    }
  });

  return null;
}
