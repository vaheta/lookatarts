import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL, MEDITATION_DURATIONS } from "@/config";
import { useMeditation } from "@/contexts/MeditationContext";
import { useUI } from "@/contexts/UIContext";

const childVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 30,
    },
  },
};

export function StartScreen() {
  const { todaysPic, duration, setDuration, startMeditation } = useMeditation();
  const { isImageLoaded, setIsImageLoaded } = useUI();

  if (!todaysPic) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="w-[1000px] max-w-[90vw] mx-auto px-4 space-y-8"
    >
      <motion.h1
        variants={childVariant}
        className="text-4xl font-serif text-black text-center"
      >
        Daily Visual Meditation
      </motion.h1>
      <motion.div
        variants={childVariant}
        className="relative bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1),0_0_6px_rgba(0,0,0,0.05)] border-[12px] border-white"
      >
        <div className="absolute inset-0 shadow-inner"></div>
        <div
          className="relative"
          style={{
            aspectRatio: `${todaysPic.description.width} / ${todaysPic.description.height}`,
          }}
        >
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-200 overflow-hidden rounded-sm">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-gray-200 via-white to-gray-200 animate-[shimmer_1.5s_infinite]"></div>
            </div>
          )}
          <img
            src={`${API_BASE_URL}/storage/${todaysPic.image_url}`}
            alt={todaysPic.description.name}
            className={`w-full h-full rounded-sm object-contain transition-opacity duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
          {isImageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <Button
                onClick={startMeditation}
                variant="outline"
                size="icon"
                className="h-20 w-20 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 transform motion-safe:hover:scale-105 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              >
                <Play className="w-6 h-6" />
              </Button>
              <Select
                value={duration}
                onValueChange={setDuration}
              >
                <SelectTrigger className="w-fit min-w-[140px] bg-white/80 backdrop-blur-sm rounded-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 backdrop-blur-sm border-input">
                  {MEDITATION_DURATIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="data-[state=checked]:bg-white data-[state=checked]:shadow-sm"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </motion.div>
      <motion.div variants={childVariant} className="space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <p>
            "{todaysPic.description.name}" ({todaysPic.description.date})
          </p>
          <p>{todaysPic.description.artist}</p>
        </div>
      </motion.div>
    </motion.div>
  );
} 