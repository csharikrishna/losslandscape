"use client";

import { useMemo, useRef } from "react";
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
  { id: "input", x: -50, type: "grid", channels: 1, size: 8, spacing: 2.0, label: "Input Image\n(1 x 8 x 8)" },
  { id: "conv1", x: -20, type: "grid", channels: 3, size: 6, spacing: 1.8, label: "Conv2D + ReLU\n(3 x 6 x 6)" },
  { id: "conv2", x: 10, type: "grid", channels: 6, size: 4, spacing: 1.5, label: "Conv2D + ReLU\n(6 x 4 x 4)" },
  { id: "dense1", x: 35, type: "dense", count: 32, spacing: 0, label: "Linear + ReLU\n(32 nodes)" },
  { id: "dense2", x: 50, type: "dense", count: 10, spacing: 0, label: "Output Logits\n(10 classes)" },
];

function DataPackets({ connections }: { connections: { start: THREE.Vector3; end: THREE.Vector3 }[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const packetCount = 1500;
  const packetData = useMemo(() => {
    if (connections.length === 0) return [];
    return Array.from({ length: packetCount }).map((_, i) => ({
      connection: connections[i % connections.length],
      progress: Math.random(),
      speed: 0.15 + Math.random() * 0.4,
    }));
  }, [connections]);

  useFrame((state, delta) => {
    if (!meshRef.current || packetData.length === 0) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < packetCount; i++) {
      const p = packetData[i];
      p.progress += delta * p.speed;
      if (p.progress > 1) p.progress = 0; 
      
      dummy.position.lerpVectors(p.connection.start, p.connection.end, p.progress);
      
      let s = 1.0;
      if (p.progress < 0.1) s = p.progress * 10;
      if (p.progress > 0.9) s = (1 - p.progress) * 10;
      dummy.scale.set(s, s, s);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (connections.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, packetCount]}>
      <sphereGeometry args={[0.2, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

export default function NeuralNetwork() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Load textures for the feature maps
  const [inputTex, conv1Tex, conv2Tex] = useTexture([
    "/input_cat.png",
    "/conv1_cat.png",
    "/conv2_cat.png"
  ]);

  const getTextureForLayer = (layerId: string) => {
    if (layerId === "input") return inputTex;
    if (layerId === "conv1") return conv1Tex;
    if (layerId === "conv2") return conv2Tex;
    return null;
  };

  // Generate nodes and edges once
  const { nodePositions, linePositions, planes, connections } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    const layerNodes: THREE.Vector3[][] = [];
    const featurePlanes: { pos: THREE.Vector3, size: number, layerId: string }[] = [];

    // --- 1. Build Nodes ---
    for (let lIndex = 0; lIndex < LAYERS.length; lIndex++) {
      const layer = LAYERS[lIndex];
      const currentLayerNodes: THREE.Vector3[] = [];

      if (layer.type === "grid") {
        const size = layer.size || 10;
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

    // --- 2. Build Edges (Lines) ---
    const linePts: number[] = [];
    const rawConnections: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    
    for (let l = 0; l < layerNodes.length - 1; l++) {
      const current = layerNodes[l];
      const next = layerNodes[l + 1];
      
      const maxConnections = 150; 
      let connectionsMade = 0;
      
      while (connectionsMade < maxConnections) {
        const sourceNode = current[Math.floor(Math.random() * current.length)];
        const targetNode = next[Math.floor(Math.random() * next.length)];
        
        const yDist = Math.abs(sourceNode.y - targetNode.y);
        if (yDist < 10 || Math.random() < 0.1) {
          linePts.push(sourceNode.x, sourceNode.y, sourceNode.z);
          linePts.push(targetNode.x, targetNode.y, targetNode.z);
          rawConnections.push({ start: sourceNode, end: targetNode });
          connectionsMade++;
        }
      }
    }

    return { 
      nodePositions: nodes, 
      linePositions: new Float32Array(linePts),
      planes: featurePlanes,
      connections: rawConnections
    };
  }, []);

  // Set up instanced mesh data
  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    
    for (let i = 0; i < nodePositions.length; i++) {
      dummy.position.copy(nodePositions[i]);
      let s = 0.5 + Math.random() * 0.5;
      
      // Default node color
      color.set("#00f0ff");

      // Highlight the "Cat" prediction node in the final Output layer (dense2).
      // dense2 contains the last 10 nodes. Let's make index 2 (the 3rd class) the winner.
      const isWinner = i === nodePositions.length - 8;
      if (isWinner) {
        color.set("#ff003c"); // Bright pink/red for the winning prediction
        s *= 2.5; // Make it significantly larger
      }

      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [nodePositions]);

  // Subtle breathing animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 1.5;
    }
    if (linesRef.current) {
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      linesRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 1.5;
      
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.15 + (Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Text Labels */}
      {LAYERS.map((layer) => (
        <Text
          key={`label-${layer.id}`}
          position={[layer.x, layer.type === "dense" ? -26 : -14, 0]}
          fontSize={1.8}
          color="#00f0ff"
          anchorX="center"
          anchorY="top"
          textAlign="center"
          lineHeight={1.4}
          fillOpacity={0.8}
        >
          {layer.label}
        </Text>
      ))}

      {/* Winning Prediction Label */}
      <Text
        position={[LAYERS[4].x + 3, (2 - 10 / 2) * 1.5, 0]}
        fontSize={1.5}
        color="#ff003c"
        anchorX="left"
        anchorY="middle"
      >
        {"← Prediction: Cat (99.8%)"}
      </Text>

      {/* Feature Map Planes with Image Textures */}
      <group rotation-x={Math.sin(0) * 0.05} position-y={0}>
        {planes.map((p, i) => {
          const tex = getTextureForLayer(p.layerId);
          return (
            <mesh key={i} position={p.pos} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[p.size, p.size]} />
              <meshBasicMaterial 
                map={tex}
                color={tex ? "#ffffff" : "#00f0ff"} 
                transparent 
                opacity={tex ? 0.7 : 0.03} 
                side={THREE.DoubleSide} 
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
              <lineSegments>
                <edgesGeometry args={[new THREE.PlaneGeometry(p.size, p.size)]} />
                <lineBasicMaterial color={tex ? "#aa00ff" : "#00f0ff"} transparent opacity={0.3} />
              </lineSegments>
            </mesh>
          );
        })}
      </group>

      {/* Nodes (Neurons) */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, nodePositions.length]} renderOrder={2}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
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
          color="#aa00ff" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
