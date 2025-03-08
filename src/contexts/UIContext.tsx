import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMeditation } from "./MeditationContext";

interface UIContextType {
  // UI visibility state
  showTimer: boolean;
  isTimerHovered: boolean;
  isStopButtonHovered: boolean;
  isImageLoaded: boolean;
  isAboutModalOpen: boolean;
  
  // Actions
  setIsTimerHovered: (hovered: boolean) => void;
  setIsStopButtonHovered: (hovered: boolean) => void;
  setIsImageLoaded: (loaded: boolean) => void;
  openAboutModal: () => void;
  closeAboutModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const { meditationState, elapsedTime, duration } = useMeditation();
  
  // UI state
  const [showTimer, setShowTimer] = useState(true);
  const [isTimerHovered, setIsTimerHovered] = useState(false);
  const [isStopButtonHovered, setIsStopButtonHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Timer visibility logic
  useEffect(() => {
    if (meditationState === "meditating") {
      setShowTimer(
        elapsedTime <= 5 || // show during first 5 seconds
        elapsedTime >= parseInt(duration) - 30 || // show during last 30 seconds
        isStopButtonHovered || // show when hovering stop button
        isTimerHovered // show when hovering timer area
      );
    }
  }, [elapsedTime, duration, meditationState, isStopButtonHovered, isTimerHovered]);

  // About modal actions
  const openAboutModal = () => setIsAboutModalOpen(true);
  const closeAboutModal = () => setIsAboutModalOpen(false);

  const value = {
    showTimer,
    isTimerHovered,
    isStopButtonHovered,
    isImageLoaded,
    isAboutModalOpen,
    setIsTimerHovered,
    setIsStopButtonHovered,
    setIsImageLoaded,
    openAboutModal,
    closeAboutModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
} 