import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import { useFullscreen, FullscreenError } from "@/hooks/useFullscreen";
import { TodaysPic } from "@/types";

type MeditationState = "idle" | "meditating" | "completed";

interface MeditationContextType {
  // Meditation state
  meditationState: MeditationState;
  hasInteracted: boolean;
  showPanAnimation: boolean;
  duration: string;
  todaysPic: TodaysPic | null;
  isLoading: boolean;
  isAutoMode: boolean;
  
  // Timer state
  elapsedTime: number;
  formatElapsedTime: () => string;           // Just elapsed time (MM:SS)
  formatElapsedAndTotalTime: () => string;   // Elapsed with total (MM:SS / MM:SS)
  formatElapsedTimeInWords: () => string;    // Elapsed time in words (X minutes Y seconds)
  
  // Actions
  setDuration: (duration: string) => void;
  startMeditation: () => void;
  stopMeditation: (resetUIStates?: () => void) => void;
  resetMeditation: () => void;
  handleInteraction: () => void;
  setTodaysPic: (pic: TodaysPic) => void;
  setIsLoading: (loading: boolean) => void;
}

const MeditationContext = createContext<MeditationContextType | undefined>(undefined);

export function MeditationProvider({ children }: { children: ReactNode }) {
  // Core meditation state
  const [meditationState, setMeditationState] = useState<MeditationState>("idle");
  const [duration, setDuration] = useState("600"); // 10 minutes in seconds
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPanAnimation, setShowPanAnimation] = useState(false);
  // Once the user pans/zooms, keep the tutorial hidden for the rest of the
  // session (hasInteracted gets reset by the auto-mode timer, so it can't be
  // used for this).
  const [panTipDismissed, setPanTipDismissed] = useState(false);
  const [todaysPic, setTodaysPic] = useState<TodaysPic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(0);

  // Fullscreen handling
  const { requestFullscreen, exitFullscreen, isFullscreen } = useFullscreen();

  // Timer integration
  const { 
    elapsedTime, 
    resetTimer, 
    formatElapsedTime,
    formatElapsedAndTotalTime,
    formatElapsedTimeInWords,
  } = useTimer(
    duration,
    meditationState,
    () => setMeditationState("completed")
  );

  // Handle auto mode toggle based on user interaction
  useEffect(() => {
    if (!hasInteracted) return;

    // Set a timer to re-enable auto mode after 3 seconds of no interaction
    const timer = setTimeout(() => {
      if (Date.now() - lastInteractionTime >= 3000) {
        setIsAutoMode(true);
        setHasInteracted(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted, lastInteractionTime]);

  // Handle pan animation visibility based on meditation state and elapsed time
  useEffect(() => {
    if (meditationState === "meditating" && !panTipDismissed && elapsedTime <= 30) {
      setShowPanAnimation(true);
    } else {
      setShowPanAnimation(false);
    }
  }, [meditationState, elapsedTime, panTipDismissed]);

  // Action handlers
  const startMeditation = useCallback(() => {
    // Reset scroll position first to ensure clean state
    window.scrollTo(0, 0);
    
    // Reset body overflow - important for mobile
    document.body.style.overflow = "hidden";
    
    // Try to enter fullscreen mode
    requestFullscreen(document.documentElement)
      .catch((err: FullscreenError) => {
        // If fullscreen fails, continue with meditation anyway
        console.warn('Failed to enter fullscreen:', err.message);
      });
    
    // Small delay to ensure scroll reset happens before any animations
    setTimeout(() => {
      resetTimer();
      setMeditationState("meditating");
      setHasInteracted(false);
      setPanTipDismissed(false);
      setIsAutoMode(true);
      
      // Reset scroll position again after state change
      window.scrollTo(0, 0);
    }, 10);
  }, [resetTimer, requestFullscreen]);

  const stopMeditation = useCallback((resetUIStates?: () => void) => {
    // Exit fullscreen if we're in it
    if (isFullscreen()) {
      exitFullscreen()
        .catch((err: FullscreenError) => {
          console.warn('Failed to exit fullscreen:', err.message);
        });
    }
    
    setMeditationState("completed");
    setIsAutoMode(false);
    if (resetUIStates) {
      resetUIStates();
    }
  }, [exitFullscreen, isFullscreen]);

  const resetMeditation = useCallback(() => {
    setMeditationState("idle");
    setHasInteracted(false);
    setIsAutoMode(true);
  }, []);

  const handleInteraction = useCallback(() => {
    setHasInteracted(true);
    setPanTipDismissed(true);
    setIsAutoMode(false);
    setLastInteractionTime(Date.now());
  }, []);

  const value = {
    meditationState,
    hasInteracted,
    showPanAnimation,
    duration,
    todaysPic,
    isLoading,
    isAutoMode,
    elapsedTime,
    formatElapsedTime,
    formatElapsedAndTotalTime,
    formatElapsedTimeInWords,
    setDuration,
    startMeditation,
    stopMeditation,
    resetMeditation,
    handleInteraction,
    setTodaysPic,
    setIsLoading,
  };

  return (
    <MeditationContext.Provider value={value}>
      {children}
    </MeditationContext.Provider>
  );
}

export function useMeditation() {
  const context = useContext(MeditationContext);
  if (context === undefined) {
    throw new Error("useMeditation must be used within a MeditationProvider");
  }
  return context;
} 