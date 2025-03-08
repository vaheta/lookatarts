import { useState, useEffect } from "react";
import { MeditationState } from "@/types";

export function useTimer(duration: string, meditationState: MeditationState, onComplete: () => void) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: number;
    if (meditationState === "meditating") {
      timer = window.setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= parseInt(duration)) {
            onComplete();
            return parseInt(duration);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [meditationState, duration, onComplete]);

  const resetTimer = () => {
    setElapsedTime(0);
  };

  const formatTime = (seconds: number, humanReadable: boolean = false, showTotal: boolean = false) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const totalMinutes = Math.floor(parseInt(duration) / 60);
    const totalRemainingSeconds = parseInt(duration) % 60;

    if (humanReadable) {
      if (minutes === 0) {
        return `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`;
      }

      if (remainingSeconds === 0) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
      }

      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`;
    }

    // Standard format (00:00)
    const formattedElapsedTime = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    
    // Include total duration if requested (00:00 / 10:00)
    if (showTotal) {
      const formattedTotalTime = `${totalMinutes.toString().padStart(2, "0")}:${totalRemainingSeconds.toString().padStart(2, "0")}`;
      return `${formattedElapsedTime}\u00A0\u00A0/\u00A0\u00A0${formattedTotalTime}`;
    }
    
    // Return timer format (00:00)
    return formattedElapsedTime;
  };

  return {
    elapsedTime,
    resetTimer,
    formatTime,
  };
} 