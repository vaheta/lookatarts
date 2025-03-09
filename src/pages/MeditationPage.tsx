import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/config";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MainLayout } from "@/components/layout/MainLayout";
import { MeditationControlsOverlay } from "@/components/MeditationControlsOverlay";
import { PanAnimation } from "@/components/PanAnimation";
import { useEffect, useState, useLayoutEffect } from "react";

export function MeditationPage() {
  const { todaysPic, handleInteraction, formatElapsedAndTotalTime, hasInteracted, showPanAnimation, meditationState } =
    useMeditation();
  const { isImageLoaded, setIsImageLoaded } = useUI();
  const isMobile = useIsMobile();
  const [isMobileDetectionComplete, setIsMobileDetectionComplete] = useState(false);
  const [centerViewFn, setCenterViewFn] = useState<((scale?: number | undefined, animationTime?: number | undefined) => void) | null>(null);
  const [imageHasLoaded, setImageHasLoaded] = useState(false);
  const [showEducationalTip, setShowEducationalTip] = useState(false);

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

  // Recenter image when window resizes or orientation changes
  useEffect(() => {
    if (!centerViewFn || !imageHasLoaded) return;

    const handleResize = () => {
      // Update the viewport height variable first
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Add a slightly longer delay to ensure viewport calculations are complete
      setTimeout(() => {
        // Use the appropriate scale after image has loaded (2 for mobile, 1 for desktop)
        centerViewFn(isMobile ? 2 : 1, 0);
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
  }, [centerViewFn, imageHasLoaded, isMobile]);

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
            initialScale={isMobile ? 0.7 : 1}
            minScale={0.8}
            maxScale={isMobile ? 6 : 4}
            smooth={true}
            onPanningStart={handleInteraction}
            onZoomStart={handleInteraction}
            centerOnInit={true}
          >
            {({ centerView }) => {
              // Store centerView function for use in resize handler
              if (!centerViewFn) {
                setCenterViewFn(() => centerView);
              }
              
              return (
                <TransformComponent
                  wrapperClass="!w-full real-h-screen" 
                  contentClass="w-full h-full flex items-center justify-center p-8"
                >
                  <div
                    className="relative bg-white rounded shadow-[0_0_40px_rgba(0,0,0,0.1),0_0_12px_rgba(0,0,0,0.05)] border-white w-fit"
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
                        <div className="absolute inset-0 bg-gray-200 overflow-hidden rounded-sm">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-200 via-white to-gray-200 animate-[shimmer_1.5s_infinite]"></div>
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
                        onLoad={() => {
                          setIsImageLoaded(true);
                          setImageHasLoaded(true);
                          
                          // First center with no animation
                          centerView(undefined, 0);
                          
                          // Update the viewport height before animation
                          const vh = window.innerHeight * 0.01;
                          document.documentElement.style.setProperty('--vh', `${vh}px`);
                          
                          // Then animate to the appropriate scale after a short delay
                          setTimeout(() => {
                            if (isMobile) {
                              // Animate zoom in on mobile - smooth transition from 0.5 to 2
                              centerView(2, 800);
                              
                              // Show the educational tip in the middle of the zoom animation
                              setTimeout(() => {
                                setShowEducationalTip(true);
                              }, 300); // Appears when zoom is halfway through
                            } else {
                              // For desktop, show the educational tip after a short delay
                              setTimeout(() => {
                                setShowEducationalTip(true);
                              }, 500);
                            }
                          }, 100);
                        }}
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
