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

// Marker settings
const MARKER_RADIUS = 0.5;
const GLOW_RADIUS = 1.1;
const GLOW_PULSE_SPEED = 2.2;
const GLOW_MIN_OPACITY = 0.12;
const GLOW_MAX_OPACITY = 0.35;

export default function TrajectoryPath({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const lineMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const lineMeshRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const markerMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

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

  useFrame(({ camera, clock }) => {
    const p = toCameraProgress(progress.get());

    // Reveal the tube progressively: only draw the index range travelled so far.
    const segmentsDrawn = Math.max(1, Math.floor(p * TUBULAR_SEGMENTS));
    const count = Math.min(totalIndices, segmentsDrawn * RADIAL_SEGMENTS * 6);
    geometry.setDrawRange(0, count);

    // "You are here" marker glides to the current point on the curve.
    const { point } = sampleTrajectory(curve, p);
    markerRef.current?.position.copy(point);
    glowRef.current?.position.copy(point);

    // Pulse the glow ring
    if (glowMaterialRef.current) {
      const t = clock.getElapsedTime();
      const pulse = GLOW_MIN_OPACITY + (GLOW_MAX_OPACITY - GLOW_MIN_OPACITY) *
        (0.5 + 0.5 * Math.sin(t * GLOW_PULSE_SPEED));
      glowMaterialRef.current.opacity = pulse;

      // Scale pulse for added effect
      const scale = 1.0 + 0.15 * Math.sin(t * GLOW_PULSE_SPEED);
      glowRef.current?.scale.setScalar(scale);
    }

    if (lineMaterialRef.current) lineUniforms.uCameraPosition.value.copy(camera.position);
    if (markerMaterialRef.current) markerUniforms.uCameraPosition.value.copy(camera.position);
  });

  return (
    <group>
      {/* Trajectory tube */}
      <mesh ref={lineMeshRef} geometry={geometry}>
        <shaderMaterial
          ref={lineMaterialRef}
          vertexShader={trajectoryVertexShader}
          fragmentShader={trajectoryFragmentShader}
          uniforms={lineUniforms}
          transparent
        />
      </mesh>

      {/* Glow ring — always renders on top */}
      <mesh ref={glowRef} renderOrder={999}>
        <sphereGeometry args={[GLOW_RADIUS, 24, 24]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color="#8FF7E0"
          transparent
          opacity={GLOW_MAX_OPACITY}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Solid core marker — always renders on top */}
      <mesh ref={markerRef} renderOrder={1000}>
        <sphereGeometry args={[MARKER_RADIUS, 20, 20]} />
        <shaderMaterial
          ref={markerMaterialRef}
          vertexShader={trajectoryVertexShader}
          fragmentShader={trajectoryFragmentShader}
          uniforms={markerUniforms}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
