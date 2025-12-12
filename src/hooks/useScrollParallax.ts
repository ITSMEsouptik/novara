"use client";

import { useState, useEffect, useRef } from "react";

interface ScrollParallax {
  scrollY: number;
  scrollProgress: number;
  normalizedScroll: number;
  scrollDirection: number; // 1 for down, -1 for up, 0 for neutral
  wavePhaseOffset: number; // Accumulated phase offset for wave animation
}

export function useScrollParallax(): ScrollParallax {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(0);
  const [wavePhaseOffset, setWavePhaseOffset] = useState(0);
  const prevScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const scrollDirectionRef = useRef(0);
  const lastAnimationTime = useRef(0);

  useEffect(() => {
    // Initialize time values in useEffect to avoid calling Date.now() during render
    const now = Date.now();
    lastScrollTime.current = now;
    lastAnimationTime.current = now;
    let ticking = false;
    const WAVE_SPEED = 0.8; // Speed of wave phase accumulation
    const RESET_DELAY = 3000; // 3 seconds in milliseconds

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? currentScrollY / documentHeight : 0;
      
      // Calculate scroll direction
      const scrollDelta = currentScrollY - prevScrollY.current;
      const timeDelta = Date.now() - lastScrollTime.current;
      
      let direction = 0;
      
      if (Math.abs(scrollDelta) > 0.5) { // Threshold to avoid jitter
        direction = scrollDelta > 0 ? 1 : -1;
      }
      
      // Reset direction when not scrolling
      if (timeDelta > 100) {
        direction = 0;
      }

      setScrollY(currentScrollY);
      setScrollProgress(progress);
      setScrollDirection(direction);
      scrollDirectionRef.current = direction; // Update ref for animation loop
      
      prevScrollY.current = currentScrollY;
      lastScrollTime.current = Date.now();
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    // Animation loop to accumulate wave phase offset
    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastAnimationTime.current) / 1000, 0.1); // Cap delta time
      lastAnimationTime.current = now;
      
      const currentDirection = scrollDirectionRef.current;
      
      // Accumulate phase offset based on scroll direction
      if (currentDirection !== 0) {
        // Clear any existing reset timer and interval
        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
          resetTimerRef.current = null;
        }
        if (resetIntervalRef.current) {
          clearInterval(resetIntervalRef.current);
          resetIntervalRef.current = null;
        }
        
        // Accumulate phase offset: positive direction (down) = outward (negative phase), negative direction (up) = inward (positive phase)
        phaseOffsetRef.current += -currentDirection * WAVE_SPEED * deltaTime;
        setWavePhaseOffset(phaseOffsetRef.current);
      } else {
        // When scrolling stops, start 3-second timer to reset
        if (resetTimerRef.current === null && phaseOffsetRef.current !== 0) {
          resetTimerRef.current = setTimeout(() => {
            // Smoothly reset phase offset to 0
            resetIntervalRef.current = setInterval(() => {
              if (Math.abs(phaseOffsetRef.current) < 0.01) {
                phaseOffsetRef.current = 0;
                setWavePhaseOffset(0);
                if (resetIntervalRef.current) {
                  clearInterval(resetIntervalRef.current);
                  resetIntervalRef.current = null;
                }
                resetTimerRef.current = null;
              } else {
                phaseOffsetRef.current *= 0.95; // Smooth decay
                setWavePhaseOffset(phaseOffsetRef.current);
              }
            }, 16); // ~60fps
          }, RESET_DELAY);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initial calculation
    updateScroll();

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      if (resetIntervalRef.current) {
        clearInterval(resetIntervalRef.current);
      }
    };
  }, []);

  // Normalize scroll to -1 to 1 range for wave displacement
  const normalizedScroll = scrollProgress * 2 - 1;

  return {
    scrollY,
    scrollProgress,
    normalizedScroll,
    scrollDirection,
    wavePhaseOffset,
  };
}
