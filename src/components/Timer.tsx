import { motion, AnimatePresence } from "framer-motion";
import { smoothTransition, springTransition } from "../utils/animations";

type TimerProps = {
  showTimer: boolean;
  formattedTime: string;
  onTimerHover: (isHovered: boolean) => void;
};

export function Timer({ showTimer, formattedTime, onTimerHover }: TimerProps) {
  return (
    <AnimatePresence>
      <div
        key="timer-area"
        className="fixed z-10 w-full h-12 py-4"
        onMouseEnter={() => onTimerHover(true)}
        onMouseLeave={() => onTimerHover(false)}
      >
        <AnimatePresence>
          {showTimer && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              transition={springTransition}
              className="fixed left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm border border-input px-4 py-2 rounded-full shadow-lg"
            >
              <span className="text-xl font-serif text-black">
                {formattedTime}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
} 