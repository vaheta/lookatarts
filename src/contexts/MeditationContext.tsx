import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
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
  
  // Timer state
  elapsedTime: number;
  formattedTime: string;
  
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
  const [todaysPic, setTodaysPic] = useState<TodaysPic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Timer integration
  const { elapsedTime, resetTimer, formatTime } = useTimer(
    duration,
    meditationState,
    () => setMeditationState("completed")
  );

  // Handle pan animation visibility based on meditation state and elapsed time
  useEffect(() => {
    if (meditationState === "meditating") {
      setShowPanAnimation(true);
      if (elapsedTime > 30) {
        setShowPanAnimation(false);
      }
    } else {
      setShowPanAnimation(false);
    }
  }, [meditationState, elapsedTime]);

  // Action handlers
  const startMeditation = useCallback(() => {
    resetTimer();
    setMeditationState("meditating");
    setHasInteracted(false);
  }, [resetTimer]);

  const stopMeditation = useCallback((resetUIStates?: () => void) => {
    setMeditationState("completed");
    if (resetUIStates) {
      resetUIStates();
    }
  }, []);

  const resetMeditation = useCallback(() => {
    setMeditationState("idle");
    setHasInteracted(false);
  }, []);

  const handleInteraction = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const value = {
    meditationState,
    hasInteracted,
    showPanAnimation,
    duration,
    todaysPic,
    isLoading,
    elapsedTime,
    formattedTime: formatTime(elapsedTime, false, true),
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