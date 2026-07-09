import { useEffect, useRef } from 'react';

interface AutoPanZoomProps {
  isActive: boolean;
  onTransform?: (transform: { x: number; y: number; scale: number }) => void;
}

export function AutoPanZoom({ isActive, onTransform }: AutoPanZoomProps) {
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const initialScaleRef = useRef<number>(0);
  const containerDimensionsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      startTimeRef.current = 0;
      return;
    }

    // Store initial position and scale when animation starts
    const isFullscreen = document.fullscreenElement !== null;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Set initial scale based on device and fullscreen state
    initialScaleRef.current = isMobile 
      ? (isFullscreen ? 4 : 3)
      : (isFullscreen ? 3 : 2);

    // Get initial container dimensions
    const container = document.querySelector('.react-transform-wrapper');
    if (container) {
      const rect = container.getBoundingClientRect();
      containerDimensionsRef.current = {
        width: rect.width,
        height: rect.height
      };
    }

    console.log('[AutoPanZoom] Initial setup:', {
      isFullscreen,
      isMobile,
      initialScale: initialScaleRef.current,
      containerDimensions: containerDimensionsRef.current
    });

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        console.log('[AutoPanZoom] Animation started at:', timestamp);
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const isFullscreen = document.fullscreenElement !== null;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      
      // Animation parameters
      const period = 10; // Slower, more meditative movement
      const t = (elapsed * (2 * Math.PI)) / period;
      
      // Base movement range - horizontal range is 2x vertical for proper figure-8 proportions
      const verticalRange = 100; // Reduced range for more subtle movement
      const horizontalRange = verticalRange * 2;
      const mobileScale = isMobile ? 0.6 : 1;
      
      // Calculate figure-8 movement
      const rawX = horizontalRange * Math.sin(t) * mobileScale;
      const rawY = verticalRange * Math.sin(2 * t) * mobileScale;
      
      // Center the movement by offsetting by negative 50% of the movement range
      // This ensures the figure-8 is centered around the container's center point
      const x = rawX - (horizontalRange * mobileScale / 2);
      const y = rawY - (verticalRange * mobileScale / 2);
      
      // Scale calculation with reduced variation
      const zoomAmount = isFullscreen ? 0.2 : (isMobile ? 0.15 : 0.1);
      const scale = initialScaleRef.current + (zoomAmount * Math.cos(t));

      // Log every second (to avoid console spam)
      if (Math.floor(elapsed) > Math.floor((elapsed - 0.016))) {
        console.log('[AutoPanZoom] Transform values:', {
          elapsed: elapsed.toFixed(2),
          t: t.toFixed(2),
          rawX: rawX.toFixed(0),
          rawY: rawY.toFixed(0),
          x: x.toFixed(0),
          y: y.toFixed(0),
          scale: scale.toFixed(2),
          ranges: {
            vertical: verticalRange,
            horizontal: horizontalRange,
            mobileScale
          }
        });
      }

      if (onTransform) {
        onTransform({ x, y, scale });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      startTimeRef.current = 0;
    };
  }, [isActive, onTransform]);

  return null;
} 