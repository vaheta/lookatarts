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
import { MainLayout } from "@/components/layout/MainLayout";
import { childVariant, staggerContainerVariant } from "@/utils/animations";
import { formatShortDuration } from "@/hooks/useTimer";

export function HomePage() {
  const { 
    todaysPic, 
    duration, 
    setDuration, 
    startMeditation,
    isLoading 
  } = useMeditation();
  const { isImageLoaded, setIsImageLoaded } = useUI();

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-black"></div>
        </div>
      </MainLayout>
    );
  }

  if (!todaysPic) return null;

  return (
    <MainLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainerVariant}
        className="w-full max-w-[1000px] mx-auto px-4 space-y-8 py-6 md:py-12 flex flex-col justify-center flex-1"
      >
        <motion.h1
          variants={childVariant}
          className="text-3xl md:text-4xl font-serif text-black text-center"
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
              willChange: 'contents',
              transform: 'translateZ(0)'
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative">
                  <Button
                    onClick={startMeditation}
                    variant="outline"
                    size="icon"
                    className="h-20 w-20 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out hover:scale-105 transform motion-safe:hover:scale-105 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  >
                    <Play className="w-6 h-6" />
                  </Button>
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 w-max">
                    <Select
                      value={duration}
                      onValueChange={setDuration}
                    >
                      <SelectTrigger 
                        variant="minimal" 
                        className="group text-white text-md md:text-xl lg:text-2xl font-serif w-fit justify-center min-w-[140px]"
                        style={{ textShadow: "0px 2px 12px rgba(0,0,0,1), 0px 2px 24px rgba(0,0,0,1)" }}
                      >
                        Meditate for <span 
                          className="underline-offset-4 no-underline group-hover:decoration-dotted group-hover:underline group-data-[state=open]:decoration-dotted group-data-[state=open]:underline transition-all"
                          
                        >
                          {/* Show short format in the trigger */}
                          {duration 
                            ? formatShortDuration(duration)
                            : <SelectValue placeholder="Select duration" />
                          }
                        </span>
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
                </div>
              </div>
            )}
          </div>
        </motion.div>
        <motion.div variants={childVariant} className="space-y-1">
          <div className="flex flex-col md:flex-row md:justify-between text-sm text-gray-600 items-center md:items-start text-center md:text-left gap-1">
            <p>
              "{todaysPic.description.name}" ({todaysPic.description.date})
            </p>
            <p>{todaysPic.description.artist}</p>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
} 