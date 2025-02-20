import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTimer } from "@/hooks/useTimer";
import { useImageLoader } from "@/hooks/useImageLoader";
import { useMeditation } from "@/hooks/useMeditation";
import { Timer } from "@/components/Timer";
import { ImageDisplay } from "@/components/ImageDisplay";
import { CompletionScreen } from "@/components/CompletionScreen";
import { StartScreen } from "@/components/StartScreen";
import { PanAnimation } from "@/components/PanAnimation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StopButton } from "@/components/StopButton";
import { fetchTodaysPic } from "@/services/api";
import { TodaysPic } from "@/types";

function App() {
  const isMobile = useIsMobile();
  const [todaysPic, setTodaysPic] = useState<TodaysPic>(null);
  const [duration, setDuration] = useState("600"); // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [isTimerHovered, setIsTimerHovered] = useState(false);
  const [isStopButtonHovered, setIsStopButtonHovered] = useState(false);

  const {
    meditationState,
    hasInteracted,
    showPanAnimation,
    setShowPanAnimation,
    startMeditation,
    stopMeditation,
    resetMeditation,
    handleInteraction,
  } = useMeditation();

  const { isImageLoaded, handleImageLoad } = useImageLoader();

  const { elapsedTime, resetTimer, formatTime } = useTimer(
    duration,
    meditationState,
    stopMeditation
  );

  useEffect(() => {
    const loadTodaysPic = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTodaysPic();
        setTodaysPic(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodaysPic();
  }, []);

  useEffect(() => {
    if (meditationState === "meditating") {
      setShowTimer(
        elapsedTime <= 5 || // show during first 5 seconds
        elapsedTime >= parseInt(duration) - 30 || // show during last 30 seconds
        isStopButtonHovered || // show when hovering stop button
        isTimerHovered, // show when hovering timer area
      );

      // Handle pan animation visibility
      if (elapsedTime > 30) {
        setShowPanAnimation(false);
      }
    }
  }, [elapsedTime, duration, meditationState, isStopButtonHovered, isTimerHovered, setShowPanAnimation]);

  const handleStartMeditation = () => {
    resetTimer();
    startMeditation();
    setShowTimer(true);
    setIsStopButtonHovered(false);
    setShowPanAnimation(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!todaysPic) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Render header only if not in meditating state */}
      {meditationState !== "meditating" && (
        <header className="text-center pt-8">
          <p className="text-sm text-gray-500">lookatarts.com</p>
        </header>
      )}

      {/* Pan Animation Overlay */}
      <AnimatePresence mode="wait">
        {showPanAnimation && !hasInteracted && (
          <PanAnimation show={true} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* Shared Main Content area */}
      <main className="flex-1 flex flex-col">
        {meditationState === "meditating" && (
          <>
            <Timer
              showTimer={showTimer}
              formattedTime={formatTime(elapsedTime)}
              onTimerHover={setIsTimerHovered}
            />
            <StopButton
              onStop={stopMeditation}
              onHover={setIsStopButtonHovered}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          {meditationState === "completed" ? (
            <CompletionScreen
              todaysPic={todaysPic}
              formattedTime={formatTime(elapsedTime, true)}
              onReset={resetMeditation}
            />
          ) : (
            <div
              key="imageContent"
              className={`w-full flex-1 flex ${
                meditationState === "meditating"
                  ? "items-stretch"
                  : "items-center py-12"
              }`}
            >
              {meditationState === "idle" ? (
                <StartScreen
                  todaysPic={todaysPic}
                  isImageLoaded={isImageLoaded}
                  onImageLoad={handleImageLoad}
                  duration={duration}
                  onDurationChange={setDuration}
                  onStart={handleStartMeditation}
                />
              ) : (
                meditationState === "meditating" && (
                  <ImageDisplay
                    todaysPic={todaysPic}
                    isImageLoaded={isImageLoaded}
                    onImageLoad={handleImageLoad}
                    isMobile={isMobile}
                    onInteraction={handleInteraction}
                  />
                )
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Render footer only if not in meditating state or completed state */}
      {meditationState !== "meditating" && meditationState !== "completed" && (
        <footer className="text-center pb-8">
          <p className="text-sm text-gray-600">Picture of the day - Today</p>
        </footer>
      )}
    </div>
  );
}

export default App;
