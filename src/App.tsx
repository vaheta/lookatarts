import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";
import { Timer } from "@/components/Timer";
import { ImageDisplay } from "@/components/ImageDisplay";
import { CompletionScreen } from "@/components/CompletionScreen";
import { StartScreen } from "@/components/StartScreen";
import { PanAnimation } from "@/components/PanAnimation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StopButton } from "@/components/StopButton";
import { fetchTodaysPic } from "@/services/api";

function App() {
  const isMobile = useIsMobile();
  const {
    meditationState,
    hasInteracted,
    showPanAnimation,
    todaysPic,
    isLoading,
    formattedTime,
    setTodaysPic,
    setIsLoading,
  } = useMeditation();

  const {
    showTimer,
    setIsTimerHovered,
    setIsStopButtonHovered,
  } = useUI();

  // Load today's picture
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
  }, [setIsLoading, setTodaysPic]);

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
              formattedTime={formattedTime}
              onTimerHover={setIsTimerHovered}
            />
            <StopButton
              onHover={setIsStopButtonHovered}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          {meditationState === "completed" ? (
            <CompletionScreen />
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
                <StartScreen />
              ) : (
                meditationState === "meditating" && (
                  <ImageDisplay />
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
