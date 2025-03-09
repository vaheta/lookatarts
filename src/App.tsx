import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useMeditation } from "@/contexts/MeditationContext";
import { AboutModal } from "@/components/AboutModal";
import { fetchTodaysPic } from "@/services/api";
import { HomePage } from "@/pages/HomePage";
import { MeditationPage } from "@/pages/MeditationPage";
import { EndPage } from "@/pages/EndPage";
import { ViewportProvider } from "@/providers/ViewportProvider";

function App() {
  const {
    meditationState,
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
    <ViewportProvider>
      {/* About Modal */}
      <AboutModal />
      
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
    </ViewportProvider>
  );
}

export default App;
