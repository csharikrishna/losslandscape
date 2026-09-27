"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { FlyControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { heightAt, TERRAIN_BOUNDS } from "@/lib/journey";

export default function ExploreControls() {
  const { camera } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Set initial explore camera position slightly elevated above the landscape
      camera.position.set(0, 18, 20);
      camera.lookAt(0, 4, 60);
      initialized.current = true;
    }
  }, [camera]);

  useFrame(() => {
    // Clamp camera within horizontal terrain bounds and prevent dipping below ground
    const x = Math.max(TERRAIN_BOUNDS.minX, Math.min(TERRAIN_BOUNDS.maxX, camera.position.x));
    const z = Math.max(TERRAIN_BOUNDS.minZ, Math.min(TERRAIN_BOUNDS.maxZ, camera.position.z));
    const groundY = heightAt(x, z);
    const minY = groundY + 1.8; // keep eye level at least 1.8 units above ground

    if (camera.position.y < minY) {
      camera.position.y = minY;
    }
    camera.position.x = x;
    camera.position.z = z;
  });

  return <FlyControls movementSpeed={18} rollSpeed={0.5} dragToLook={true} />;
}
