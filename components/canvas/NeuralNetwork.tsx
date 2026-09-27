"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";

interface LayerDef {
  id: string;
  x: number;
  type: "grid" | "dense";
  channels?: number;
  size?: number; // for grid: size x size
  count?: number; // for dense: number of nodes
  spacing: number;
  label: string;
}

const LAYERS: LayerDef[] = [
  { id: "input", x: -50, type: "grid", channels: 1, size: 8, spacing: 2.0, label: "Input Image\n(1 × 8 × 8)" },
  { id: "conv1", x: -20, type: "grid", channels: 3, size: 6, spacing: 1.8, label: "Conv2D + ReLU\n(3 × 6 × 6)" },
  { id: "conv2", x: 10, type: "grid", channels: 6, size: 4, spacing: 1.5, label: "Conv2D + ReLU\n(6 × 4 × 4)" },
  { id: "dense1", x: 35, type: "dense", count: 32, spacing: 0, label: "Linear + ReLU\n(32 units)" },
  { id: "dense2", x: 50, type: "dense", count: 10, spacing: 0, label: "Logits\n(10 classes)" },
];

const OUTPUT_COUNT = 10;
const WINNER_CLASS = 2; // "Cat" prediction (index 2 out of 10)

export default function NeuralNetwork() {
  const rootRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Load textures for the feature maps
  const [inputTex, conv1Tex, conv2Tex] = useTexture([
    "/input_cat.png",
    "/conv1_cat.png",
    "/conv2_cat.png",
  ]);

  const getTextureForLayer = (layerId: string) => {
    if (layerId === "input") return inputTex;
    if (layerId === "conv1") return conv1Tex;
    if (layerId === "conv2") return conv2Tex;
    return null;
  };

  // Generate nodes and edges once
  const { nodePositions, linePositions, planes } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    const layerNodes: THREE.Vector3[][] = [];
    const featurePlanes: { pos: THREE.Vector3; size: number; layerId: string }[] = [];

    // --- 1. Build Nodes ---
    for (let lIndex = 0; lIndex < LAYERS.length; lIndex++) {
      const layer = LAYERS[lIndex];
      const currentLayerNodes: THREE.Vector3[] = [];

      if (layer.type === "grid") {
        const size = layer.size || 8;
        const channels = layer.channels || 1;
        const spacing = layer.spacing;
        const offset = (size - 1) * spacing * 0.5;

        for (let c = 0; c < channels; c++) {
          const cz = (c - (channels - 1) / 2) * (size * spacing * 0.5);
          const cy = (c - (channels - 1) / 2) * (size * spacing * 0.25);

          featurePlanes.push({
            pos: new THREE.Vector3(layer.x, cy, cz),
            size: size * spacing + 1,
            layerId: layer.id,
          });

          for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
              const py = y * spacing - offset + cy;
              const pz = z * spacing - offset + cz;
              const px = layer.x;
              const vec = new THREE.Vector3(px, py, pz);
              nodes.push(vec);
              currentLayerNodes.push(vec);
            }
          }
        }
      } else {
        const count = layer.count || 10;
        for (let i = 0; i < count; i++) {
          const py = (i - count / 2) * 1.5;
          const vec = new THREE.Vector3(layer.x, py, 0);
          nodes.push(vec);
          currentLayerNodes.push(vec);
        }
      }
      layerNodes.push(currentLayerNodes);
    }

    // --- 2. Build Conv & Dense Synaptic Edges ---
    const linePts: number[] = [];

    for (let l = 0; l < layerNodes.length - 1; l++) {
      const current = layerNodes[l];
      const next = layerNodes[l + 1];
      const currentLayerDef = LAYERS[l];
      const nextLayerDef = LAYERS[l + 1];

      if (currentLayerDef.type === "grid" && nextLayerDef.type === "grid") {
        // Receptive field sampling for conv layers (3x3 spatial proximity)
        for (const targetNode of next) {
          // Connect to ~4 spatially closest source nodes in previous layer
          const candidates = [...current]
            .map((src) => ({
              src,
              distSq: (src.y - targetNode.y) ** 2 + (src.z - targetNode.z) ** 2,
            }))
            .sort((a, b) => a.distSq - b.distSq)
            .slice(0, 3);

          for (const cand of candidates) {
            linePts.push(cand.src.x, cand.src.y, cand.src.z);
            linePts.push(targetNode.x, targetNode.y, targetNode.z);
          }
        }
      } else {
        // Dense layer connections (structured subset for visual clarity)
        const connectionsPerTarget = l === 2 ? 3 : 5;
        for (let t = 0; t < next.length; t++) {
          const targetNode = next[t];
          for (let k = 0; k < connectionsPerTarget; k++) {
            const srcIdx = Math.floor(((t * connectionsPerTarget + k) * 7) % current.length);
            const sourceNode = current[srcIdx];
            linePts.push(sourceNode.x, sourceNode.y, sourceNode.z);
            linePts.push(targetNode.x, targetNode.y, targetNode.z);
          }
        }
      }
    }

    return {
      nodePositions: nodes,
      linePositions: new Float32Array(linePts),
      planes: featurePlanes,
    };
  }, []);

  // Set up instanced mesh data inside useLayoutEffect (after refs are attached)
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const winnerIdx = nodePositions.length - OUTPUT_COUNT + WINNER_CLASS;

    for (let i = 0; i < nodePositions.length; i++) {
      dummy.position.copy(nodePositions[i]);
      const isWinner = i === winnerIdx;

      // Clean on-palette coloring: winner is Signal Coral (#F2542D), others Signal Mint (#8FF7E0)
      if (isWinner) {
        color.set("#F2542D");
        dummy.scale.setScalar(2.2);
      } else {
        color.set("#8FF7E0");
        dummy.scale.setScalar(0.75);
      }

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // Recompute bounding sphere so frustum culling doesn't use uninitialized identity bounds
    mesh.computeBoundingSphere();
  }, [nodePositions]);

  // Unified breathing animation: entire network structure breathes as a unit
  useFrame((state) => {
    if (!rootRef.current) return;
    const time = state.clock.elapsedTime;
    rootRef.current.rotation.x = Math.sin(time * 0.1) * 0.03;
    rootRef.current.position.y = Math.sin(time * 0.2) * 0.8;

    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.16 + (Math.sin(time * 1.5) * 0.5 + 0.5) * 0.08;
    }
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      {/* 3D Text Labels */}
      {LAYERS.map((layer) => (
        <Text
          key={`label-${layer.id}`}
          position={[layer.x, layer.type === "dense" ? -24 : -14, 0]}
          fontSize={1.7}
          color="#8FF7E0"
          anchorX="center"
          anchorY="top"
          textAlign="center"
          lineHeight={1.3}
          fillOpacity={0.85}
        >
          {layer.label}
        </Text>
      ))}

      {/* Winning Prediction Label */}
      <Text
        position={[LAYERS[4].x + 3.2, (WINNER_CLASS - OUTPUT_COUNT / 2) * 1.5, 0]}
        fontSize={1.5}
        color="#F2542D"
        anchorX="left"
        anchorY="middle"
      >
        {"← Prediction: Cat (99.8%)"}
      </Text>

      {/* Feature Map Planes */}
      <group>
        {planes.map((p, i) => {
          const tex = getTextureForLayer(p.layerId);
          return (
            <mesh key={i} position={p.pos} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[p.size, p.size]} />
              <meshBasicMaterial
                map={tex}
                color="#ffffff"
                transparent
                opacity={tex ? 0.75 : 0.04}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
              <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(p.size, p.size)]} />
                <lineBasicMaterial color="#5FE3C9" transparent opacity={0.25} />
              </lineSegments>
            </mesh>
          );
        })}
      </group>

      {/* Nodes (Neurons) — base material must be white so instance colors aren't darkened */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodePositions.length]}
        renderOrder={2}
      >
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {/* Edges (Synapses) */}
      <lineSegments ref={linesRef} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#2E6FF2"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
