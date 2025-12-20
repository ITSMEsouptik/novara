"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial } from "three";
import { createWaveMaterial } from "./WaveMaterial";

interface WaveBackgroundProps {
  scrollOffset?: number;
  wavePhaseOffset?: number;
  layers?: number;
}

export function WaveBackground({ 
  scrollOffset = 0, 
  wavePhaseOffset = 0, 
  layers = 3 
}: WaveBackgroundProps) {
  const meshRefs = useRef<Mesh[]>([]);
  const timeRef = useRef(0);

  // Create materials for each layer
  const materials = useMemo(() => {
    return Array.from({ length: layers }, (_, i) => {
      const offset = i * 0.3; // Stagger layers
      return createWaveMaterial(offset, scrollOffset, wavePhaseOffset);
    });
  }, [layers, scrollOffset, wavePhaseOffset]);

  // Update scroll values in materials when they change
  useEffect(() => {
    materials.forEach((material) => {
      if (material.uniforms) {
        material.uniforms.uScrollOffset.value = scrollOffset;
        material.uniforms.uWavePhaseOffset.value = wavePhaseOffset;
      }
    });
  }, [scrollOffset, wavePhaseOffset, materials]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    // Update all wave meshes
    meshRefs.current.forEach((mesh, index) => {
      if (mesh && mesh.material) {
        const material = mesh.material as ShaderMaterial;
        if (material.uniforms) {
          material.uniforms.uTime.value = timeRef.current + index * 0.3;
          material.uniforms.uScrollOffset.value = scrollOffset;
          material.uniforms.uWavePhaseOffset.value = wavePhaseOffset;
        }
      }
    });
  });

  return (
    <>
      {Array.from({ length: layers }, (_, i) => {
        const zPos = i * -2; // Layer waves at different Z depths
        const scale = 1 + i * 0.1; // Slightly scale up each layer for depth
        
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) meshRefs.current[i] = el;
            }}
            position={[0, 0, zPos]}
            scale={[scale, scale, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={materials[i]}
          >
            <planeGeometry args={[100, 100, 120, 120]} />
          </mesh>
        );
      })}
    </>
  );
}



