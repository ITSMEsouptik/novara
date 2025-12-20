"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { ReactNode, useEffect } from "react";

interface Scene3DProps {
  children: ReactNode;
  className?: string;
}

function CameraController() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    // Calculate camera distance to ensure plane width matches screen width
    // Using: distance = (planeWidth / 2) / tan(FOV / 2)
    // Plane is now 100 units wide, FOV is 95 degrees
    const planeWidth = 100;
    const fovRad = (95 * Math.PI) / 180;
    const baseDistance = (planeWidth / 2) / Math.tan(fovRad / 2);
    
    // Move camera closer to zoom in - adjust multiplier for zoom level
    const adjustedDistance = baseDistance * 0.6;
    
    camera.position.set(0, adjustedDistance, 0);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  
  return null;
}

export function Scene3D({ children, className = "" }: Scene3DProps) {
  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]} // Limit pixel ratio for performance
      camera={{ position: [0, 25, 0], fov: 95 }}
    >
      <CameraController />
      <PerspectiveCamera makeDefault position={[0, 25, 0]} fov={95} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 10, 0]} intensity={1.2} />
      <directionalLight position={[10, 10, 0]} intensity={0.6} />
      <directionalLight position={[-10, 10, 0]} intensity={0.6} />
      {children}
    </Canvas>
  );
}



