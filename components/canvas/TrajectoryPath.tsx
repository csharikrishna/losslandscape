"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAST_STOP } from "@/lib/journey";
import { buildTrajectoryCurve } from "@/lib/trajectory";
import { trajectoryVertexShader, trajectoryFragmentShader } from "@/lib/shaders";
import { journey } from "@/lib/journey-state";

const TUBULAR_SEGMENTS = 500;
const RADIAL_SEGMENTS = 8;
const TUBE_RADIUS = 0.11;

// Marker settings
const MARKER_RADIUS = 0.45;
const GLOW_RADIUS = 1.1;

// Comet trail settings
const TRAIL_COUNT = 5;
const TRAIL_BASE_RADIUS = 0.14;

export default function TrajectoryPath() {
  const markerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Trail refs
  const trailRefs = useRef<(THREE.Mesh | null)[]>(new Array(TRAIL_COUNT).fill(null));
  const trailPositions = useRef<THREE.Vector3[]>(
    Array.from({ length: TRAIL_COUNT }, () => new THREE.Vector3())
  );
  const markerPos = useMemo(() => new THREE.Vector3(), []);

  const curve = useMemo(() => buildTrajectoryCurve(), []);

  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, TUBULAR_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, false),
    [curve]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const totalIndices = useMemo(() => TUBULAR_SEGMENTS * RADIAL_SEGMENTS * 6, []);

  const arcLUT = useMemo(() => {
    const lengths = curve.getLengths(TUBULAR_SEGMENTS);
    const total = lengths[TUBULAR_SEGMENTS] || 1;
    return lengths.map((l) => l / total);
  }, [curve]);

  const lineUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#8FF7E0") },
      uOpacity: { value: 0.95 },
    }),
    []
  );

  const markerUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#EAFFFA") },
      uOpacity: { value: 1.0 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const u = journey.smoothed;
    const t = Math.max(0, Math.min(1, u / LAST_STOP));

    // Convert parameter t to arc-length fraction s so tube reveal matches marker position exactly
    const lutIdx = Math.max(0, Math.min(TUBULAR_SEGMENTS, Math.round(t * TUBULAR_SEGMENTS)));
    const s = arcLUT[lutIdx] ?? t;
    const segmentsDrawn = Math.max(1, Math.floor(s * TUBULAR_SEGMENTS));
    const count = Math.min(totalIndices, segmentsDrawn * RADIAL_SEGMENTS * 6);
    geometry.setDrawRange(0, count);

    // Marker is positioned exactly at curve point for parameter t (exact alignment with stop waypoints)
    curve.getPoint(t, markerPos);

    if (markerRef.current) {
      markerRef.current.position.copy(markerPos);
    }
    if (glowRef.current) {
      glowRef.current.position.copy(markerPos);
    }

    // Pulse the outer glow
    if (glowMaterialRef.current) {
      const time = clock.getElapsedTime();
      const pulse = Math.sin(time * 2.2) * 0.5 + 0.5;
      glowMaterialRef.current.opacity = 0.12 + pulse * 0.23;
    }

    // Update comet trail segments with frame-rate independent damping
    const lerpFactor = 1 - Math.exp(-9.8 * dt);
    let leadPos = markerPos;
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const currentPos = trailPositions.current[i];
      currentPos.lerp(leadPos, lerpFactor);
      const mesh = trailRefs.current[i];
      if (mesh) {
        mesh.position.copy(currentPos);
      }
      leadPos = currentPos;
    }
  });

  return (
    <group>
      {/* The progressive tube */}
      <mesh geometry={geometry}>
        <shaderMaterial
          vertexShader={trajectoryVertexShader}
          fragmentShader={trajectoryFragmentShader}
          uniforms={lineUniforms}
          transparent
        />
      </mesh>

      {/* The leading marker sphere */}
      <mesh ref={markerRef}>
        <sphereGeometry args={[MARKER_RADIUS, 16, 16]} />
        <shaderMaterial
          vertexShader={trajectoryVertexShader}
          fragmentShader={trajectoryFragmentShader}
          uniforms={markerUniforms}
          transparent
        />
      </mesh>

      {/* Pulsing outer aura around the marker */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[GLOW_RADIUS, 16, 16]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          color="#8FF7E0"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Comet trail spheres */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => {
        const falloff = 1 - (i + 1) / (TRAIL_COUNT + 1);
        const radius = TRAIL_BASE_RADIUS * falloff;
        const opacity = 0.45 * falloff;

        return (
          <mesh
            key={i}
            ref={(el) => {
              trailRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[radius, 8, 8]} />
            <meshBasicMaterial
              color="#8FF7E0"
              transparent
              opacity={opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
