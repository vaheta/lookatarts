import { useRef, useEffect } from 'react';
import { ACTIVE_NOISE_CONFIG } from '../../constants/noise';

export function Noise() {
  // Use constants directly from the active configuration
  const grainRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let frame = 0;
    let animationFrameId: number;

    // Extract values from the active config
    const {
      patternSize,
      patternScaleX,
      patternScaleY,
      patternRefreshInterval,
      patternAlpha,
      animated,
    } = ACTIVE_NOISE_CONFIG;

    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const patternCtx = patternCanvas.getContext('2d');
    if (!patternCtx) return;
    
    const patternData = patternCtx.createImageData(patternSize, patternSize);
    const patternPixelDataLength = patternSize * patternSize * 4;

    const resize = () => {
      const parentElement = canvas.parentElement;
      if (!parentElement) return;
      
      // Set size based on parent element rather than window
      canvas.width = parentElement.offsetWidth * window.devicePixelRatio;
      canvas.height = parentElement.offsetHeight * window.devicePixelRatio;

      ctx.scale(patternScaleX, patternScaleY);
    };

    const updatePattern = () => {
      for (let i = 0; i < patternPixelDataLength; i += 4) {
        const value = Math.random() * 255;
        patternData.data[i] = value;
        patternData.data[i + 1] = value;
        patternData.data[i + 2] = value;
        patternData.data[i + 3] = patternAlpha;
      }
      patternCtx.putImageData(patternData, 0, 0);
    };

    const drawGrain = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat')!;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const loop = () => {
      if (animated) {
        if (frame % patternRefreshInterval === 0) {
          updatePattern();
          drawGrain();
        }
        frame++;
        animationFrameId = window.requestAnimationFrame(loop);
      } else {
        // If not animated, just draw once
        updatePattern();
        drawGrain();
      }
    };

    window.addEventListener('resize', resize);
    resize();
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      if (animated) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); // Empty dependency array as we're using global constants

  return (
    <canvas 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      style={{ pointerEvents: 'none' }}
      ref={grainRef} 
    />
  );
} 