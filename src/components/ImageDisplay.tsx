import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { API_BASE_URL } from "@/config";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";
import { useIsMobile } from "@/hooks/useIsMobile";

export function ImageDisplay() {
  const { todaysPic, handleInteraction } = useMeditation();
  const { isImageLoaded, setIsImageLoaded } = useUI();
  const isMobile = useIsMobile();

  if (!todaysPic) return null;

  return (
    <div className="relative w-full">
      <TransformWrapper
        initialScale={1}
        minScale={0.8}
        maxScale={isMobile ? 6 : 4}
        smooth={true}
        onPanningStart={handleInteraction}
        onZoomStart={handleInteraction}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full flex items-center justify-center p-8"
        >
          <div className="relative bg-white rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.1),0_0_12px_rgba(0,0,0,0.05)] border-[24px] border-white w-fit">
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
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
} 