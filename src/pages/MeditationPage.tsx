import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/config";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MainLayout } from "@/components/layout/MainLayout";
import { MeditationControlsOverlay } from "@/components/MeditationControlsOverlay";
import { PanAnimation } from "@/components/PanAnimation";
import { useEffect, useState, useCallback } from "react";

export function MeditationPage() {
  const { todaysPic, handleInteraction, formatElapsedAndTotalTime, hasInteracted, showPanAnimation, meditationState } =
    useMeditation();
  const { isImageLoaded, setIsImageLoaded } = useUI();
  const isMobile = useIsMobile();
  const [isMobileDetectionComplete, setIsMobileDetectionComplete] = useState(false);
  const [centerViewFn, setCenterViewFn] = useState<((scale?: number | undefined, animationTime?: number | undefined) => void) | null>(null);
  const [imageHasLoaded, setImageHasLoaded] = useState(false);

  // Set a flag once mobile detection is complete
  useEffect(() => {
    setIsMobileDetectionComplete(true);
  }, [isMobile]);

  // Set overflow: hidden on body only when in meditation mode
  useEffect(() => {
    // Save the current overflow style to restore it later
    const originalOverflow = document.body.style.overflow;
    
    // Only set overflow to hidden when actively meditating
    if (meditationState === "meditating") {
      document.body.style.overflow = "hidden";
    } else {
      // Make sure it's scrollable in other states
      document.body.style.overflow = "";
    }
    
    // Cleanup function to restore the original overflow style when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [meditationState]);

  // Recenter image when window resizes or orientation changes
  useEffect(() => {
    if (!centerViewFn || !imageHasLoaded) return;

    const handleResize = () => {
      // Add a small delay to ensure viewport calculations are complete
      setTimeout(() => {
        // Use the appropriate scale after image has loaded (2 for mobile, 1 for desktop)
        centerViewFn(isMobile ? 2 : 1, 0);
      }, 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [centerViewFn, imageHasLoaded, isMobile]);

  // Don't render until we have the image and mobile detection is complete
  if (!todaysPic || !isMobileDetectionComplete) return null;
  console.log("Yes is mobile?",isMobile);

  return (
    <MainLayout hideHeaderFooter>
      <MeditationControlsOverlay formattedTime={formatElapsedAndTotalTime()} />

      {/* Pan Animation Overlay */}
      <AnimatePresence mode="wait">
        {showPanAnimation && !hasInteracted && (
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
          {({ centerView, setTransform }) => {
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
                      className={`max-h-[80vh] w-auto rounded-sm transition-opacity duration-300 ${
                        isImageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => {
                        setIsImageLoaded(true);
                        setImageHasLoaded(true);
                        
                        // First center with no animation
                        centerView(undefined, 0);
                        
                        // Then animate to the appropriate scale after a short delay
                        setTimeout(() => {
                          if (isMobile) {
                            // Animate zoom in on mobile - smooth transition from 0.5 to 2
                            centerView(2, 800);
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
    </MainLayout>
  );
}
