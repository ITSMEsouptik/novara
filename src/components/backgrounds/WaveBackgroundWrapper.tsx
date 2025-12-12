"use client";

import { useState, useEffect, Suspense } from "react";
import { Scene3D } from "./Scene3D";
import { WaveBackground } from "./WaveBackground";
import { useScrollParallax } from "@/hooks/useScrollParallax";

interface WaveBackgroundWrapperProps {
  className?: string;
}

function WaveContent() {
  const { normalizedScroll, wavePhaseOffset } = useScrollParallax();
  return (
    <WaveBackground 
      scrollOffset={normalizedScroll} 
      wavePhaseOffset={wavePhaseOffset}
      layers={3} 
    />
  );
}

export function WaveBackgroundWrapper({ className = "" }: WaveBackgroundWrapperProps) {
  const [isWebGLSupported, setIsWebGLSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check WebGL support
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    setIsWebGLSupported(!!gl);
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
    <div className={`${className}`}>
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50"></div>}>
        <Scene3D className="w-full h-full">
          <WaveContent />
        </Scene3D>
      </Suspense>
    </div>
  );
}
