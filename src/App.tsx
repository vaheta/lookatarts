import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Play, StopCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function App() {
  const [todaysPic, setTodaysPic] = useState<{
    image_url: string;
    description: {
      name: string;
      artist: string;
    };
  } | null>(null);
  const [duration, setDuration] = useState("600"); // 10 minutes in seconds
  const [elapsedTime, setElapsedTime] = useState(0);
  const [meditationState, setMeditationState] = useState<MeditationState>("idle");

  const fetchTodaysPic = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/todays_pic/metadata`);
      const data = await response.json();
      setTodaysPic({
        image_url: data.image_url,
        description: data.description,
      });
    } catch (error) {
      console.error("Error fetching today's picture:", error);
    }
  };

  useEffect(() => {
    fetchTodaysPic();
  }, []);

  useEffect(() => {
    let timer: number;
    if (meditationState === "meditating") {
      timer = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [meditationState]);

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

  if (!todaysPic) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
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
              <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-white">
                      Visual Meditation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={`${API_BASE_URL}/images/${todaysPic.image_url}`}
                      alt={todaysPic.description.name}
                      className="w-full rounded-lg"
                    />
                    <p className="text-sm text-gray-400 text-center">
                      {todaysPic.description.name} by {todaysPic.description.artist}
                    </p>
                    <div className="flex flex-col items-center space-y-4">
                      <Select
                        value={duration}
                        onValueChange={(value: string) => setDuration(value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">5 minutes</SelectItem>
                          <SelectItem value="450">7:30 minutes</SelectItem>
                          <SelectItem value="600">10 minutes</SelectItem>
                          <SelectItem value="750">12:30 minutes</SelectItem>
                          <SelectItem value="900">15 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={startMeditation}
                        className="bg-white text-black hover:bg-gray-200"
                        size="lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Begin Meditation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {meditationState === "meditating" && (
              <div className="fixed inset-0">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-gray-900/80 px-4 py-2 rounded-full backdrop-blur-sm">
                  <span className="text-xl font-mono">{formatTime(elapsedTime)}</span>
                </div>
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={2}
                >
                  <TransformComponent
                    wrapperClass="!w-screen !h-screen"
                    contentClass="!w-full !h-full"
                  >
                    <img
                      src={`${API_BASE_URL}/images/${todaysPic.image_url}`}
                      alt={todaysPic.description.name}
                      className="w-full h-full object-contain"
                    />
                  </TransformComponent>
                </TransformWrapper>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                  <Button
                    onClick={stopMeditation}
                    className="bg-white text-black hover:bg-gray-200 rounded-full w-12 h-12 p-0"
                  >
                    <StopCircle className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}

            {meditationState === "completed" && (
              <div className="max-w-md mx-auto px-4 py-8">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-white">
                      Meditation Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-center">
                    <p className="text-gray-400">
                      You meditated for {formatTime(elapsedTime)}
                    </p>
                    <Button
                      onClick={resetMeditation}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      Return Home
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
