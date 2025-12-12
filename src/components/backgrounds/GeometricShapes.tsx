"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import * as THREE from "three";

interface ShapeConfig {
  type: 'sphere' | 'box' | 'torus' | 'octahedron';
  position: [number, number, number];
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  movementSpeed: [number, number, number];
  size: number;
  opacity: number;
}

interface GeometricShapesProps {
  scrollOffset?: number;
  count?: number;
}

// Generate random shape configurations
function generateShapes(count: number): ShapeConfig[] {
  const shapes: ShapeConfig[] = [];
  const types: ShapeConfig['type'][] = ['sphere', 'box', 'torus', 'octahedron'];
  
  // Distribute shapes more evenly across the viewport
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 4;
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 0.8 + Math.random() * 1.5; // 0.8 to 2.3 (larger for better visibility)
    
    // Grid-based distribution with some randomness
    const gridX = (i % gridSize) - gridSize / 2;
    const gridY = Math.floor(i / gridSize) - gridSize / 2;
    const randomOffset = (Math.random() - 0.5) * 2;
    
    shapes.push({
      type,
      position: [
        gridX * spacing + randomOffset, // X: distributed in grid
        gridY * spacing + randomOffset, // Y: distributed in grid
        -5 - Math.random() * 15, // Z: -20 to -5 (all in front of camera at Z: 15)
      ],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ],
      rotationSpeed: [
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
      ],
      movementSpeed: [
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.004,
      ],
      size,
      opacity: 0.25 + Math.random() * 0.15, // 0.25 to 0.4 (increased for visibility)
    });
  }
  
  return shapes;
}

function Shape({ config, scrollOffset }: { config: ShapeConfig; scrollOffset: number }) {
  const meshRef = useRef<Mesh>(null);
  
  // Initial position and rotation
  const currentPosition = useRef([...config.position]);
  const currentRotation = useRef([...config.rotation]);
  const timeOffset = useRef(0);
  
  // Initialize timeOffset in useEffect to avoid calling Math.random during render
  useEffect(() => {
    timeOffset.current = Math.random() * Math.PI * 2;
  }, []);
  
  // Set initial scale
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(config.size);
    }
  }, [config.size]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime + timeOffset.current;
    
    // Update rotation
    currentRotation.current[0] += config.rotationSpeed[0];
    currentRotation.current[1] += config.rotationSpeed[1];
    currentRotation.current[2] += config.rotationSpeed[2];
    
    // Update position (floating movement with sine waves for organic motion)
    currentPosition.current[0] += config.movementSpeed[0] + Math.sin(time * 0.3) * 0.002;
    currentPosition.current[1] += config.movementSpeed[1] + Math.cos(time * 0.4) * 0.002;
    currentPosition.current[2] += config.movementSpeed[2] + Math.sin(time * 0.25) * 0.001;
    
    // Apply scroll-based parallax
    const parallaxX = scrollOffset * 1.5;
    const parallaxY = scrollOffset * 1.2;
    const parallaxZ = scrollOffset * 2.5;
    
    // Boundary wrapping (wrap around if out of bounds)
    if (Math.abs(currentPosition.current[0]) > 15) {
      currentPosition.current[0] = -Math.sign(currentPosition.current[0]) * 15;
    }
    if (Math.abs(currentPosition.current[1]) > 12) {
      currentPosition.current[1] = -Math.sign(currentPosition.current[1]) * 12;
    }
    if (currentPosition.current[2] > -3 || currentPosition.current[2] < -22) {
      currentPosition.current[2] = currentPosition.current[2] > -3 ? -22 : -3;
    }
    
    // Apply transformations
    meshRef.current.position.set(
      currentPosition.current[0] + parallaxX,
      currentPosition.current[1] + parallaxY,
      currentPosition.current[2] + parallaxZ
    );
    
    meshRef.current.rotation.set(
      currentRotation.current[0],
      currentRotation.current[1],
      currentRotation.current[2]
    );
    
    // Subtle pulsing effect
    const pulse = 1 + Math.sin(time * 0.8) * 0.08;
    meshRef.current.scale.setScalar(config.size * pulse);
  });
  
  // Grey color based on initial depth - darker when further back (more negative Z)
  // Z ranges from -20 to -5, normalize to 0-1
  const depthFactor = Math.max(0, Math.min(1, (config.position[2] + 20) / 15)); // Normalize Z position
  const colorIntensity = 0.35 + depthFactor * 0.35; // Range: 0.35 to 0.7 (brighter for visibility)
  const r = colorIntensity * 107 / 255;
  const g = colorIntensity * 114 / 255;
  const b = colorIntensity * 128 / 255;
  
  // Create geometry and material
  const geometry = useMemo(() => {
    switch (config.type) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 32, 32);
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'torus':
        return new THREE.TorusGeometry(0.6, 0.3, 16, 32);
      case 'octahedron':
        return new THREE.OctahedronGeometry(1, 0);
      default:
        return new THREE.SphereGeometry(1, 32, 32);
    }
  }, [config.type]);
  
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: config.opacity,
      metalness: 0.15,
      roughness: 0.7,
      emissive: new THREE.Color(r * 0.1, g * 0.1, b * 0.1),
      emissiveIntensity: 0.1,
    });
  }, [r, g, b, config.opacity]);
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
    />
  );
}

export function GeometricShapes({ scrollOffset = 0, count = 20 }: GeometricShapesProps) {
  const shapes = useMemo(() => generateShapes(count), [count]);
  
  return (
    <>
      {/* Test shape - large bright sphere to verify rendering */}
      <mesh position={[0, 0, -10]} scale={[3, 3, 3]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#6b7280" 
          transparent 
          opacity={0.5}
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      
      {shapes.map((config, index) => (
        <Shape key={index} config={config} scrollOffset={scrollOffset} />
      ))}
    </>
  );
}
