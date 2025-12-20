"use client";

import { useState, useEffect, Suspense } from "react";
import { Scene3D } from "./Scene3D";
import { GeometricShapes } from "./GeometricShapes";
import { useScrollParallax } from "@/hooks/useScrollParallax";

interface GeometricShapesWrapperProps {
  className?: string;
}

function ShapesContent() {
  const { normalizedScroll } = useScrollParallax();
  return <GeometricShapes scrollOffset={normalizedScroll} count={20} />;
}

export function GeometricShapesWrapper({ className = "" }: GeometricShapesWrapperProps) {
  const [isWebGLSupported, setIsWebGLSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer1 = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    
    // Check WebGL support
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const timer2 = setTimeout(() => {
      setIsWebGLSupported(!!gl);
    }, 0);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Don't render on server
  if (!isMounted) {
    return null;
  }

  // Fallback if WebGL not supported
  if (!isWebGLSupported) {
    return (
      <div className={`${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50"></div>
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50"></div>}>
        <Scene3D className="w-full h-full">
          <ShapesContent />
        </Scene3D>
      </Suspense>
    </div>
  );
}



