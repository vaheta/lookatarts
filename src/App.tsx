import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMeditation } from "@/contexts/MeditationContext";
import { PanAnimation } from "@/components/PanAnimation";
import { fetchTodaysPic } from "@/services/api";
import { HomePage } from "@/pages/HomePage";
import { MeditationPage } from "@/pages/MeditationPage";
import { EndPage } from "@/pages/EndPage";

function App() {
  const isMobile = useIsMobile();
  const {
    meditationState,
    hasInteracted,
    showPanAnimation,
    setTodaysPic,
    setIsLoading,
  } = useMeditation();

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

  return (
    <>
      {/* Pan Animation Overlay */}
      <AnimatePresence mode="wait">
        {showPanAnimation && !hasInteracted && (
          <PanAnimation show={true} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* Main Page Content based on meditation state */}
      <AnimatePresence mode="wait">
        {meditationState === "completed" ? (
          <EndPage />
        ) : meditationState === "meditating" ? (
          <MeditationPage />
        ) : (
          <HomePage />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
