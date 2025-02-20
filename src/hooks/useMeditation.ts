import { useState } from "react";
import { MeditationState } from "@/types";

export function useMeditation() {
  const [meditationState, setMeditationState] = useState<MeditationState>("idle");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPanAnimation, setShowPanAnimation] = useState(false);

  const startMeditation = () => {
    setMeditationState("meditating");
    setShowPanAnimation(true);
  };

  const stopMeditation = () => {
    setMeditationState("completed");
    setShowPanAnimation(false);
  };

  const resetMeditation = () => {
    setMeditationState("idle");
    // These are commented out because they cause the pan animation to not show up on the next meditation in the same session
    // setHasInteracted(false);
    // setShowPanAnimation(false);
  };

  const handleInteraction = () => {
    setHasInteracted(true);
  };

  return {
    meditationState,
    hasInteracted,
    showPanAnimation,
    setShowPanAnimation,
    startMeditation,
    stopMeditation,
    resetMeditation,
    handleInteraction,
  };
} 