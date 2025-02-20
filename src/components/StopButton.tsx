import { motion } from "framer-motion";
import { StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type StopButtonProps = {
  onStop: () => void;
  onHover: (isHovered: boolean) => void;
};

export function StopButton({ onStop, onHover }: StopButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 20, x: "-50%" }}
      transition={{ duration: 0.4, exit: { duration: 0 } }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
    >
      <Button
        onClick={onStop}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        variant="outline"
        className="bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full w-12 h-12 p-0 text-black shadow-lg"
      >
        <StopCircle className="w-6 h-6" />
      </Button>
    </motion.div>
  );
} 