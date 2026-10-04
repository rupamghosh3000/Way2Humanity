'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SceneProps {
  scrollProgress: number;
}

function PhysicalScene({ scrollProgress }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Gentle continuous ambient rotation
      groupRef.current.rotation.y = scrollProgress * Math.PI * 1.5 + Math.sin(Date.now() * 0.0005) * 0.05;
      groupRef.current.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Studio Lighting */}
      <ambientLight intensity={0.8} color="#F9F8F6" />
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.2}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} color="#E3DCD2" />

      {/* Clay Hands holding Paper Mesh - Hero Stage */}
      <mesh position={[0, 0, 0]} rotation={[0.2, 0.4, 0]}>
        <boxGeometry args={[2.2, 3.0, 0.05]} />
        <meshPhysicalMaterial
          color="#F4F2ED"
          roughness={0.8}
          clearcoat={0.1}
          reflectivity={0.2}
        />
      </mesh>

      {/* Clay Hand Sculptural Base */}
      <mesh position={[-1.2, -1.0, -0.3]} rotation={[0.5, 0.2, -0.4]}>
        <cylinderGeometry args={[0.4, 0.6, 2.5, 32]} />
        <meshStandardMaterial color="#C28F7B" roughness={0.9} />
      </mesh>
      <mesh position={[1.2, -1.0, -0.3]} rotation={[0.5, -0.2, 0.4]}>
        <cylinderGeometry args={[0.4, 0.6, 2.5, 32]} />
        <meshStandardMaterial color="#C28F7B" roughness={0.9} />
      </mesh>

      {/* Floating Ceramic Shards & Nodes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3.5 + Math.sin(i * 1.5) * 0.5;
        const y = Math.sin(i * 2 + scrollProgress * 5) * 1.2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
            rotation={[i * 0.4, i * 0.2, 0]}
          >
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#E3DCD2' : '#8A9A86'} roughness={0.85} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function GlobalCanvas({ scrollProgress = 0 }: { scrollProgress?: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F9F8F6]">
      <Canvas
        shadows
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <PhysicalScene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
