"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { buildTrajectoryCurve, sampleTrajectory, toCameraProgress } from "@/lib/trajectory";
import { trajectoryVertexShader, trajectoryFragmentShader } from "@/lib/shaders";

const TUBULAR_SEGMENTS = 500;
const RADIAL_SEGMENTS = 8;
const TUBE_RADIUS = 0.11;

export default function TrajectoryPath({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const lineMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const lineMeshRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const markerMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const curve = useMemo(() => buildTrajectoryCurve(), []);

  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, TUBULAR_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, false),
    [curve]
  );

  const totalIndices = useMemo(
    () => TUBULAR_SEGMENTS * RADIAL_SEGMENTS * 6,
    []
  );

  const lineUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#8FF7E0") },
      uCameraPosition: { value: new THREE.Vector3() },
      uOpacity: { value: 0.95 },
    }),
    []
  );

  const markerUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#EAFFFA") },
      uCameraPosition: { value: new THREE.Vector3() },
      uOpacity: { value: 1 },
    }),
    []
  );

  useFrame(({ camera }) => {
    const p = toCameraProgress(progress.get());

    // Reveal the tube progressively: only draw the index range travelled so far.
    const segmentsDrawn = Math.max(1, Math.floor(p * TUBULAR_SEGMENTS));
    const count = Math.min(totalIndices, segmentsDrawn * RADIAL_SEGMENTS * 6);
    geometry.setDrawRange(0, count);

    // "You are here" marker glides to the current point on the curve.
    const { point } = sampleTrajectory(curve, p);
    markerRef.current?.position.copy(point);

    if (lineMaterialRef.current) lineUniforms.uCameraPosition.value.copy(camera.position);
    if (markerMaterialRef.current) markerUniforms.uCameraPosition.value.copy(camera.position);
  });

  return (
    <group>
      <mesh ref={lineMeshRef} geometry={geometry}>
        <shaderMaterial
          ref={lineMaterialRef}
          vertexShader={trajectoryVertexShader}
          fragmentShader={trajectoryFragmentShader}
          uniforms={lineUniforms}
          transparent
        />
      </mesh>
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.34, 20, 20]} />
        <shaderMaterial
          ref={markerMaterialRef}
          vertexShader={trajectoryVertexShader}
          fragmentShader={trajectoryFragmentShader}
          uniforms={markerUniforms}
        />
      </mesh>
    </group>
  );
}
