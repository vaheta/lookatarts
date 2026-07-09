import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/config";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MainLayout } from "@/components/layout/MainLayout";
import { MeditationControlsOverlay } from "@/components/MeditationControlsOverlay";
import { PanAnimation } from "@/components/PanAnimation";
import { AutoPanZoom } from "@/components/AutoPanZoom";
import { useEffect, useState, useLayoutEffect, useRef, useCallback } from "react";

export function MeditationPage() {
  const { 
    todaysPic, 
    handleInteraction, 
    formatElapsedAndTotalTime, 
    hasInteracted, 
    showPanAnimation, 
    meditationState,
    isAutoMode 
  } = useMeditation();
  const { isImageLoaded, setIsImageLoaded } = useUI();
  const isMobile = useIsMobile();
  const [isMobileDetectionComplete, setIsMobileDetectionComplete] = useState(false);
  const centerViewFnRef = useRef<((scale?: number | undefined, animationTime?: number | undefined) => void) | null>(null);
  const [imageHasLoaded, setImageHasLoaded] = useState(false);
  const [showEducationalTip, setShowEducationalTip] = useState(false);
  const transformWrapperRef = useRef<any>(null);

  // Set a flag once mobile detection is complete
  useEffect(() => {
    setIsMobileDetectionComplete(true);
  }, [isMobile]);

  // Reset showEducationalTip when meditation state changes
  useEffect(() => {
    if (meditationState !== "meditating") {
      setShowEducationalTip(false);
    }
  }, [meditationState]);

  // Memoize the centerView callback to avoid unnecessary re-renders
  const handleCenterView = useCallback((centerView: (scale?: number, animationTime?: number) => void) => {
    centerViewFnRef.current = centerView;
  }, []);

  // Handle auto mode transform updates
  const handleAutoTransform = useCallback(({ x, y, scale }: { x: number; y: number; scale: number }) => {
    if (!transformWrapperRef.current || !isAutoMode || !imageHasLoaded) return;

    const wrapper = transformWrapperRef.current;
    
    wrapper.setTransform(
      x, // X position
      y, // Y position
      scale, // Scale is already calculated with base scale in AutoPanZoom
      50 // Use a very short transition for smooth animation
    );
  }, [isAutoMode, imageHasLoaded]);

  // Handle image load with memoization
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    setImageHasLoaded(true);
    
    // Set initial scale and center the image
    if (centerViewFnRef.current) {
      const isFullscreen = document.fullscreenElement !== null;
      const baseScale = isMobile 
        ? (isFullscreen ? 4 : 3)
        : (isFullscreen ? 3 : 2);
      
      centerViewFnRef.current(baseScale, 0);
      setShowEducationalTip(true);
    }
  }, [isMobile, setIsImageLoaded]);

  // Update viewport height calculation on mount and when meditation state changes
  useLayoutEffect(() => {
    // Function to update the custom property
    function updateViewportHeight() {
      // Reset scroll position to top - CRITICAL for mobile browsers
      window.scrollTo(0, 0);
      
      // Force scroll reset with a small delay to ensure it happens after browser UI adjustments
      setTimeout(() => window.scrollTo(0, 0), 50);
      
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Force a reflow to ensure the DOM updates
      document.body.style.minHeight = '100vh';
      void document.body.offsetHeight; // Force reflow
    }
    
    // Update viewport height immediately on component mount
    updateViewportHeight();
    
    // Update again after a short delay to account for mobile browser UI changes
    const timeoutId = setTimeout(updateViewportHeight, 100);
    
    // Additional reset after browser UI fully settles (especially important for Chrome mobile)
    const finalResetTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
      updateViewportHeight();
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(finalResetTimeout);
    };
  }, [meditationState]);

  // Set overflow: hidden on body only when in meditation mode
  useEffect(() => {
    // Save the current overflow and touch-action styles to restore them later
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    
    // Only set overflow to hidden when actively meditating
    if (meditationState === "meditating") {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      // Make sure it's scrollable in other states
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    
    // Cleanup function to restore the original styles when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      
      // Also ensure we reset any scroll position locks
      window.scrollTo(0, 0);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [meditationState]);

  // Handle screen size changes
  useEffect(() => {
    if (!imageHasLoaded) return;

    const handleResize = () => {
      // Recenter the image when screen size changes
      if (centerViewFnRef.current) {
        const baseScale = isMobile ? 2 : 1;
        centerViewFnRef.current(baseScale, 0);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('fullscreenchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('fullscreenchange', handleResize);
    };
  }, [imageHasLoaded, isMobile]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('[MeditationPage] State:', {
      isAutoMode,
      meditationState,
      hasInteracted,
      isImageLoaded
    });
  }, [isAutoMode, meditationState, hasInteracted, isImageLoaded]);

  // Recenter image when window resizes or orientation changes
  useEffect(() => {
    if (!centerViewFnRef.current || !imageHasLoaded) return;

    const handleResize = () => {
      // Update the viewport height variable first
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Add a slightly longer delay to ensure viewport calculations are complete
      setTimeout(() => {
        // Use the appropriate scale after image has loaded (2 for mobile, 1 for desktop)
        if (centerViewFnRef.current) {
          centerViewFnRef.current(isMobile ? 2 : 1, 0);
        }
      }, 100);
    };

    // Call resize handler immediately to ensure proper initial layout
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    // Add visibilitychange event to recalculate when tab becomes visible again
    document.addEventListener('visibilitychange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('visibilitychange', handleResize);
    };
  }, [imageHasLoaded, isMobile]);

  // Don't render until we have the image and mobile detection is complete
  if (!todaysPic || !isMobileDetectionComplete) return null;

  return (
    <MainLayout hideHeaderFooter>
      <div 
        className="fixed inset-0 overflow-hidden" 
        style={{ 
          touchAction: 'none',
          // Ensure this container doesn't affect scroll behavior outside
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          isolation: 'isolate'
        }}
      >
        <MeditationControlsOverlay formattedTime={formatElapsedAndTotalTime()} />

        {/* Pan Animation Overlay */}
        <AnimatePresence mode="wait">
          {showPanAnimation && !hasInteracted && showEducationalTip && (
            <PanAnimation show={true} isMobile={isMobile} />
          )}
        </AnimatePresence>

        <div className="relative w-full h-full">
          <TransformWrapper
            ref={transformWrapperRef}
            initialScale={1}
            minScale={1}
            maxScale={isMobile ? 8 : 6}
            smooth={true}
            onPanningStart={handleInteraction}
            onZoomStart={handleInteraction}
            centerOnInit={true}
            limitToBounds={true}
            alignmentAnimation={{ sizeX: 0, sizeY: 0, velocityAlignmentTime: 0 }}
            velocityAnimation={{ equalToMove: true, sensitivity: 0.5, animationTime: 800 }}
          >
            {({ centerView }) => {
              // Store centerView function for use in resize handler
              if (centerViewFnRef.current !== centerView) {
                handleCenterView(centerView);
              }
              
              return (
                <TransformComponent
                  wrapperClass="!w-full !h-full" 
                  contentClass="w-full h-full flex items-center justify-center"
                >
                  <div
                    className="relative bg-card rounded shadow-[0_0_40px_rgba(0,0,0,0.1),0_0_12px_rgba(0,0,0,0.05)] border-card w-fit mx-auto my-auto"
                    style={{
                      borderWidth: isMobile ? "6px" : "12px",
                      maxHeight: isMobile ? "calc(100vh - 40px)" : "80vh", // Ensure image container doesn't exceed viewport
                    }}
                  >
                    <div className="absolute inset-0 shadow-inner"></div>
                    <div
                      className="relative"
                      style={{
                        aspectRatio: `${todaysPic.description.width} / ${todaysPic.description.height}`,
                      }}
                    >
                      {!isImageLoaded && (
                        <div className="absolute inset-0 bg-muted overflow-hidden rounded-sm">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-muted via-background to-muted animate-[shimmer_1.5s_infinite]"></div>
                        </div>
                      )}
                      <img
                        src={`${API_BASE_URL}/storage/${todaysPic.image_url}`}
                        alt={todaysPic.description.name}
                        className={`w-auto rounded-sm transition-opacity duration-300 ${
                          isImageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          maxHeight: isMobile ? "calc(100vh - 60px)" : "75vh", // Ensure image doesn't exceed viewport
                        }}
                        onLoad={handleImageLoad}
                      />
                      {/* Auto Pan-Zoom Animation */}
                      <AutoPanZoom 
                        isActive={isAutoMode && meditationState === "meditating"} 
                        onTransform={handleAutoTransform}
                      />
                    </div>
                  </div>
                </TransformComponent>
              );
            }}
          </TransformWrapper>
        </div>
      </div>
    </MainLayout>
  );
}
