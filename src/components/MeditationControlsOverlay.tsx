import { Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";
import { smoothTransition, springTransition } from "../utils/animations";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AudioToggle } from "@/components/AudioToggle";

type MeditationControlsOverlayProps = {
  formattedTime: string;
};

export function MeditationControlsOverlay({ formattedTime }: MeditationControlsOverlayProps) {
  const { stopMeditation } = useMeditation();
  const { 
    showTimer, 
    setIsTimerHovered, 
    setIsStopButtonHovered 
  } = useUI();

  const handleStop = () => {
    stopMeditation(() => {
      setIsTimerHovered(false);
      setIsStopButtonHovered(false);
    });
  };

  return (
    <>
      {/* Timer Component */}
      <AnimatePresence>
        <div
          key="timer-area"
          className="fixed z-10 w-full h-12 py-4"
          onMouseEnter={() => setIsTimerHovered(true)}
          onMouseLeave={() => setIsTimerHovered(false)}
        >
          <AnimatePresence>
            {showTimer && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -20, x: "-50%" }}
                transition={smoothTransition}
                className="fixed left-1/2 -translate-x-1/2 z-10 bg-card/80 backdrop-blur-sm border border-input px-4 py-2 rounded-full shadow-lg"
              >
                <span className="text-xl font-serif text-foreground">
                  {formattedTime}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatePresence>

      {/* Controls (Theme, Stop, Audio) Buttons */}
      <AnimatePresence>
        <motion.div
                initial={{ opacity: 0, y: 20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 20, x: "-50%" }}
                transition={springTransition}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3"
            onMouseEnter={() => setIsStopButtonHovered(true)}
            onMouseLeave={() => setIsStopButtonHovered(false)}
        >
            {/* Theme Toggle Button */}
            <ThemeToggle />
            
            {/* Stop Button */}
            <Button
              onClick={handleStop}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card/90 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 transform motion-safe:hover:scale-105 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            >
              <Square className="w-4 h-4" />
            </Button>
            
            {/* Audio Toggle Button */}
            <AudioToggle />
        </motion.div>
      </AnimatePresence>
    </>
  );
} 