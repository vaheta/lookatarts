import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useMeditation } from "@/contexts/MeditationContext";
import { AboutModal } from "@/components/AboutModal";
import { fetchTodaysPic } from "@/services/api";
import { HomePage } from "@/pages/HomePage";
import { MeditationPage } from "@/pages/MeditationPage";
import { EndPage } from "@/pages/EndPage";
import { ViewportProvider } from "@/providers/ViewportProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

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

  // Reset scroll position when meditation state changes
  useEffect(() => {
    // Reset scroll position on page change
    window.scrollTo(0, 0);
    
    // Check if we're on mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
      // For mobile browsers, we need additional handling
      // Set timeout to ensure scroll reset happens after rendering
      setTimeout(() => {
        window.scrollTo(0, 0);
        
        // Update viewport height calculation
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }, 50);
      
      // For Chrome mobile specifically, a second reset helps
      setTimeout(() => window.scrollTo(0, 0), 300);
    }

    // Reset any lingering body styles that might affect scrolling
    if (meditationState !== "meditating") {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    }
  }, [meditationState]);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
