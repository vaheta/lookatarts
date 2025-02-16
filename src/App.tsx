import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Play, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

type MeditationState = "idle" | "meditating" | "completed";

type TodaysPic = {
  image_url: string;
  description: {
    name: string;
    artist: string;
    date: string;
    width: number;
    height: number;
    dimensions: string;
    link: string;
    repository: string;
  };
} | null;

function App() {
  const [todaysPic, setTodaysPic] = useState<TodaysPic>(null);
  const [duration, setDuration] = useState("600"); // 10 minutes in seconds
  const [elapsedTime, setElapsedTime] = useState(0);
  const [meditationState, setMeditationState] = useState<MeditationState>("idle");
  const [isStopButtonHovered, setIsStopButtonHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodaysPic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/todays_pic/metadata`);
      const data = await response.json();
      setTodaysPic({
        image_url: data.image_url,
        description: data.description,
      });
    } catch (error) {
      console.error("Error fetching today's picture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysPic();
  }, []);

  useEffect(() => {
    let timer: number;
    if (meditationState === "meditating") {
      timer = window.setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= parseInt(duration)) {
            stopMeditation();
            return parseInt(duration);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [meditationState, duration]);

  const startMeditation = () => {
    setElapsedTime(0);
    setMeditationState("meditating");
  };

  const stopMeditation = () => {
    setMeditationState("completed");
  };

  const resetMeditation = () => {
    setMeditationState("idle");
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const shouldShowTimer = () => {
    if (meditationState !== "meditating") return false;
    if (isStopButtonHovered) return true;
    
    const totalDuration = parseInt(duration);
    return (
      elapsedTime <= 10 || // First 5 seconds
      elapsedTime >= totalDuration - 30 // Last 30 seconds
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  if (!todaysPic) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={meditationState}
            initial={{ opacity: 0, scale: meditationState === "meditating" ? 0.8 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: meditationState === "idle" ? 0.8 : 1 }}
            transition={{ duration: 0.5 }}
          >
            {meditationState === "idle" && (
              <div className="h-screen flex flex-col">
                <div className="text-center pt-8">
                  <p className="text-sm text-gray-500">lookatarts.com</p>
                </div>
                <div className="flex-1 flex items-center">
                  <div className="w-[1000px] max-w-[90vw] mx-auto px-4 space-y-8">
                    <h1 className="text-4xl font-serif text-black text-center">
                      Daily Visual Meditation
                    </h1>
                    <div className="space-y-4">
                      <div className="relative bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1),0_0_6px_rgba(0,0,0,0.05)] border-[12px] border-white">
                        <div className="absolute inset-0 shadow-inner"></div>
                        <div 
                          className="relative"
                          style={{
                            aspectRatio: `${todaysPic.description.width} / ${todaysPic.description.height}`,
                          }}
                        >
                          <img
                            src={`${API_BASE_URL}/images/${todaysPic.image_url}`}
                            alt={todaysPic.description.name}
                            className="w-full h-full rounded-sm object-contain"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                            <Button
                              onClick={startMeditation}
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
                            >
                              <Play className="w-5 h-5" />
                            </Button>
                            <Select
                              value={duration}
                              onValueChange={(value: string) => setDuration(value)}
                            >
                              <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                                <SelectItem value="450">7:30 minutes</SelectItem>
                                <SelectItem value="600">10 minutes</SelectItem>
                                <SelectItem value="750">12:30 minutes</SelectItem>
                                <SelectItem value="900">15 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-600">
                          <p>"{todaysPic.description.name}" ({todaysPic.description.date})</p>
                          <p>{todaysPic.description.artist}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center pb-8">
                  <p className="text-sm text-gray-600">Picture of the day - Today</p>
                </div>
              </div>
            )}

            {meditationState === "meditating" && (
              <div className="fixed inset-0 bg-white">
                <AnimatePresence>
                  {shouldShowTimer() && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, x: "-50%" }}
                      exit={{ opacity: 0, y: -20, x: "-50%" }}
                      transition={{ duration: 0.2 }}
                      className="fixed top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg"
                    >
                      <span className="text-xl font-serif text-black">
                        {formatTime(elapsedTime)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <TransformWrapper
                  initialScale={1}
                  minScale={0.8}
                  maxScale={4}
                  smooth={true}
                >
                  <TransformComponent
                    wrapperClass="!w-screen !h-screen"
                    contentClass="!w-full !h-full flex items-center justify-center p-8"
                  >
                    <div className="relative bg-white rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.1),0_0_12px_rgba(0,0,0,0.05)] border-[24px] border-white w-fit">
                      <div className="absolute inset-0 shadow-inner"></div>
                      <img
                        src={`${API_BASE_URL}/images/${todaysPic.image_url}`}
                        alt={todaysPic.description.name}
                        className="max-h-[80vh] w-auto rounded-sm"
                      />
                    </div>
                  </TransformComponent>
                </TransformWrapper>
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                  <Button
                    onClick={stopMeditation}
                    onMouseEnter={() => setIsStopButtonHovered(true)}
                    onMouseLeave={() => setIsStopButtonHovered(false)}
                    className="bg-black text-white hover:bg-gray-800 rounded-full w-12 h-12 p-0"
                  >
                    <StopCircle className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}

            {meditationState === "completed" && (
              <div className="max-w-md mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-center text-black mb-4">
                  Meditation Complete
                </h1>
                <div className="space-y-4 text-center">
                  <p className="text-gray-600">
                    You meditated for {formatTime(elapsedTime)}
                  </p>
                  <Button
                    onClick={resetMeditation}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Return Home
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
