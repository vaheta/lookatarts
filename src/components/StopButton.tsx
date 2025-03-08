import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";

type StopButtonProps = {
  onHover: (hovered: boolean) => void;
};

export function StopButton({ onHover }: StopButtonProps) {
  const { stopMeditation } = useMeditation();
  const { setIsTimerHovered, setIsStopButtonHovered } = useUI();

  const handleStop = () => {
    stopMeditation(() => {
      setIsTimerHovered(false);
      setIsStopButtonHovered(false);
      onHover(false);
    });
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <Button
        onClick={handleStop}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 transform motion-safe:hover:scale-105 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      >
        <Square className="w-4 h-4" />
      </Button>
    </div>
  );
} 