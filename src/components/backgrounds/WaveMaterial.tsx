"use client";

import { useMemo } from "react";
import { ShaderMaterial } from "three";

interface WaveMaterialProps {
  time?: number;
  scrollOffset?: number;
  wavePhaseOffset?: number;
}

export function createWaveMaterial(
  time: number = 0, 
  scrollOffset: number = 0,
  wavePhaseOffset: number = 0
): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uTime: { value: time },
      uScrollOffset: { value: scrollOffset },
      uWavePhaseOffset: { value: wavePhaseOffset },
      uColor1: { value: [0.12, 0.13, 0.15] }, // Dark grey (#1f2937)
      uColor2: { value: [0.42, 0.45, 0.48] }, // Medium grey (#6b7280)
      uColor3: { value: [0.95, 0.96, 0.98] }, // Light grey (#f3f4f6)
    },
    vertexShader: `
      uniform float uTime;
      uniform float uScrollOffset;
      uniform float uWavePhaseOffset;
      
      varying vec3 vPosition;
      varying float vElevation;
      
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // Single center point at origin - waves spread from center to edges
        vec2 center = vec2(0.0, 0.0);
        
        // Calculate distance from center (using XZ plane for top-down view)
        float dist = length(modelPosition.xz - center);
        
        // Create multiple concentric circular ripples from center
        // Wave phase combines time animation with accumulated phase offset
        float basePhase1 = dist * 0.15 - uTime * 0.6;
        float basePhase2 = dist * 0.2 - uTime * 0.5 + 2.0;
        float basePhase3 = dist * 0.12 - uTime * 0.7 + 4.0;
        
        // Apply wave phase offset: negative offset = outward expansion, positive offset = inward contraction
        float wave1 = sin(basePhase1 - uWavePhaseOffset) * 0.4;
        float wave2 = sin(basePhase2 - uWavePhaseOffset) * 0.3;
        float wave3 = sin(basePhase3 - uWavePhaseOffset) * 0.25;
        
        // Combine waves for smooth concentric ripples
        float elevation = wave1 + wave2 + wave3;
        
        // Add scroll-based parallax effect (subtle position shift)
        elevation += uScrollOffset * 0.2;
        
        // Apply elevation to Y position (upward from plane)
        modelPosition.y += elevation;
        
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectedPosition;
        
        vPosition = modelPosition.xyz;
        vElevation = elevation;
      }
    `,
      fragmentShader: `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      
      varying vec3 vPosition;
      varying float vElevation;
      
      void main() {
        // Create gradient based on elevation and position
        float mixFactor = (vElevation + 1.5) * 0.4; // Normalize for circular waves
        mixFactor = clamp(mixFactor, 0.0, 1.0);
        vec3 color = mix(uColor1, uColor2, mixFactor);
        
        // Add subtle variation based on radial distance for depth
        float radialDist = length(vPosition.xz);
        float positionFactor = sin(radialDist * 0.1) * 0.5 + 0.5;
        color = mix(color, uColor3, positionFactor * 0.1);
        
        // Apply subtle opacity - lighter and more subtle
        float opacity = 0.08 + mixFactor * 0.12;
        
        gl_FragColor = vec4(color, opacity);
      }
    `,
    transparent: true,
    side: 2, // DoubleSide
  });
}

export function WaveMaterial({ 
  time = 0, 
  scrollOffset = 0, 
  wavePhaseOffset = 0 
}: WaveMaterialProps) {
  const material = useMemo(
    () => createWaveMaterial(time, scrollOffset, wavePhaseOffset),
    [time, scrollOffset, wavePhaseOffset]
  );

  return <primitive object={material} attach="material" />;
}



