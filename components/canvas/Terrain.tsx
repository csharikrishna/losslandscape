"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { heightAt, TERRAIN_BOUNDS } from "@/lib/terrain-data";
import { terrainVertexShader, terrainFragmentShader } from "@/lib/shaders";

const SEGMENTS_X = 200;
const SEGMENTS_Z = 240;

function buildTerrainGeometry() {
  const { minX, maxX, minZ, maxZ } = TERRAIN_BOUNDS;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const cz = (minZ + maxZ) / 2;

  const geometry = new THREE.PlaneGeometry(width, depth, SEGMENTS_X, SEGMENTS_Z);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, cz);

  const pos = geometry.attributes.position as THREE.BufferAttribute;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = heightAt(x, z);
    pos.setY(i, y);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();

  return { geometry, minY, maxY };
}

export default function Terrain({ isExploreMode = false }: { isExploreMode?: boolean }) {
  const { camera } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, minY, maxY } = useMemo(() => buildTerrainGeometry(), []);

  const uniforms = useMemo(
    () => ({
      uColorLow: { value: new THREE.Color("#2E6FF2") },
      uColorMidLow: { value: new THREE.Color("#22B8B0") },
      uColorMid: { value: new THREE.Color("#F2C14E") },
      uColorHigh: { value: new THREE.Color("#F2542D") },
      uMinY: { value: minY },
      uMaxY: { value: maxY },
      uLightDir: { value: new THREE.Vector3(0.4, 0.85, 0.35).normalize() },
      uFogColor: { value: new THREE.Color("#070A12") },
      uFogNear: { value: 46 },
      uFogFar: { value: 150 },
      uCameraPosition: { value: new THREE.Vector3() },
      uContourSpacing: { value: 1.35 },
      uContourOpacity: { value: 0.32 },
      uContourColor: { value: new THREE.Color("#5FE3C9") },
      uTime: { value: 0 },
      uMatrixBlend: { value: 0 },
    }),
    [minY, maxY]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    uniforms.uCameraPosition.value.copy(camera.position);
    uniforms.uTime.value += delta;
    
    // Smoothly transition the matrix effect on/off
    const targetBlend = isExploreMode ? 1.0 : 0.0;
    uniforms.uMatrixBlend.value += (targetBlend - uniforms.uMatrixBlend.value) * (delta * 2.0);
  });

  return (
    <mesh geometry={geometry} receiveShadow>
      <shaderMaterial
        ref={materialRef}
        vertexShader={terrainVertexShader}
        fragmentShader={terrainFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
