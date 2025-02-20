import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Play, StopCircle } from "lucide-react";
import Lottie from "lottie-react";
import panAnimation from "@/assets/PanAnimation.json";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight } from "lucide-react";

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
    about: string;
  };
} | null;

const DEFAULT_PIC = {
  image_url: "images/artwork_20.jpg",
  description: {
    artist: "Albert Bierstadt",
    name: "The Rocky Mountains, Lander's Peak",
    date: "1863",
    width: 3811,
    height: 2284,
    dimensions: "73 1/2 x 120 3/4 in. (186.7 x 306.7 cm)",
    link: "http://www.metmuseum.org/art/collection/search/10154",
    repository: "Metropolitan Museum of Art, New York, NY",
    about: "This and other popular canvases by the German-born Albert Bierstadt shaped the visual identity of the American West in the United States and abroad. In early 1859 he accompanied a government survey expedition, headed by Frederick W. Lander, to the Nebraska Territory. By summer, the party had reached the Wind River Range of the Rocky Mountains in present-day Wyoming. Painted in New York after Bierstadt's return from these travels, this work advertised the landscape as a frontier destined to be claimed by White settlers, according to the doctrine of Manifest Destiny. This belief that Americans were the divinely ordained \"masters\" of the continent systematically ignored with dire consequences the presence of Indigenous populations, such as the Shoshone peoples depicted in the picture's foreground. Publicly exhibited to great acclaim, this monumental painting established Bierstadt as a key competitor of the preeminent landscape painter, Frederic Edwin Church (see, for example, 09.95). It was purchased in 1865 for the then-astounding sum of $25,000 by James McHenry, an American living in London. Bierstadt later bought it back and gave or sold it to his brother Edward.",
  },
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

function App() {
  const isMobile = useIsMobile();
  const [todaysPic, setTodaysPic] = useState<TodaysPic>(null);
  const [duration, setDuration] = useState("600"); // 10 minutes in seconds
  const [elapsedTime, setElapsedTime] = useState(0);
  const [meditationState, setMeditationState] =
    useState<MeditationState>("idle");
  const [isStopButtonHovered, setIsStopButtonHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showPanAnimation, setShowPanAnimation] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTimerHovered, setIsTimerHovered] = useState(false);

  const fetchTodaysPic = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/todays_pic/metadata`);
      if (!response.ok) {
        throw new Error('Server error');
      }
      const data = await response.json();
      setTodaysPic({
        image_url: data.image_url,
        description: data.description,
      });
    } catch (error) {
      console.error("Error fetching today's picture:", error);
      setTodaysPic(DEFAULT_PIC);
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

  useEffect(() => {
    if (meditationState === "meditating") {
      setShowTimer(
        elapsedTime <= 5 || // show during first 5 seconds
        elapsedTime >= parseInt(duration) - 30 || // show during last 30 seconds
        isStopButtonHovered || // show when hovering stop button
        isTimerHovered, // show when hovering timer area
      );

      // Handle pan animation visibility
      if (elapsedTime > 30) {
        setShowPanAnimation(false);
      }
    }
  }, [elapsedTime, duration, meditationState, isStopButtonHovered, isTimerHovered]);

  const startMeditation = () => {
    setElapsedTime(0);
    setMeditationState("meditating");
    setShowTimer(true);
    setIsStopButtonHovered(false);
    setShowPanAnimation(true);
  };

  const stopMeditation = () => {
    setMeditationState("completed");
  };

  const resetMeditation = () => {
    setMeditationState("idle");
    setElapsedTime(0);
    setIsStopButtonHovered(false);
    
    // These are commented out because they cause the pan animation to not show up on the next meditation in the same session
    // setHasInteracted(false);
    //setShowPanAnimation(false);
  };

  const formatTime = (seconds: number, humanReadable: boolean = false) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (humanReadable) {
      if (minutes === 0) {
        return `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`;
      }

      if (remainingSeconds === 0) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
      }

      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`;
    }

    // Return timer format (00:00)
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleImageLoad = () => {
    // Add minimum delay of 100ms before showing image
    setTimeout(() => {
      setIsImageLoaded(true);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="h-screen flex flex-col">
          <div className="text-center pt-8">
            <p className="text-sm text-gray-500">lookatarts.com</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-black"></div>
          </div>
          <div className="text-center pb-8">
            <p className="text-sm text-gray-600">Picture of the day - Today</p>
          </div>
        </div>
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
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
      }
    }
  };

  const containerVariant = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Render header only if not in meditating state */}
      {meditationState !== "meditating" && (
        <header className="text-center pt-8">
          <p className="text-sm text-gray-500">lookatarts.com</p>
        </header>
      )}

      {/* Pan Animation Overlay */}
      <AnimatePresence mode="wait">
        {showPanAnimation && !hasInteracted && (
          <motion.div
            variants={containerVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div 
              variants={childVariant}
              className="w-32 h-32"
            >
              <Lottie 
                animationData={panAnimation} 
                loop={true}
                style={{ filter: 'brightness(0) invert(1)' }} 
              />
            </motion.div>
            <motion.p
              variants={childVariant}
              className="-mt-6 text-lg font-base text-white mix-blend-difference"
            >
              {isMobile ? "Pinch and pan to explore details." : "Zoom and pan with your mouse to explore details."}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Main Content area */}
      <main className="flex-1 flex flex-col">
        {meditationState === "meditating" && (
          <>
            <AnimatePresence>
              <div 
                key="timer-area"
                className="fixed top-4 z-10 w-full h-12"
                onMouseEnter={() => setIsTimerHovered(true)}
                onMouseLeave={() => setIsTimerHovered(false)}
              >
                <AnimatePresence>
                  {showTimer && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, x: "-50%" }}
                      exit={{ opacity: 0, y: -20, x: "-50%" }}
                      transition={{
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                        exit: { duration: 0 },
                      }}
                      className="fixed top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm border border-input px-4 py-2 rounded-full shadow-lg"
                    >
                      <span className="text-xl font-serif text-black">
                        {formatTime(elapsedTime)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatePresence>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 20, x: "-50%" }}
                transition={{ duration: 0.4, exit: { duration: 0 } }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
              >
                <Button
                  onClick={stopMeditation}
                  onMouseEnter={() => setIsStopButtonHovered(true)}
                  onMouseLeave={() => setIsStopButtonHovered(false)}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full w-12 h-12 p-0 text-black shadow-lg"
                >
                  <StopCircle className="w-6 h-6" />
                </Button>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        <AnimatePresence mode="wait">
          {meditationState === "completed" ? (
            <motion.div
              key="completed"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 1 },
                visible: { opacity: 1 },
              }}
              className="w-full flex-1 flex items-center"
            >
              <div className="max-w-5xl mx-auto px-4 py-8 w-full">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  className="space-y-8"
                >
                  <motion.div
                    variants={childVariant}
                    className="flex flex-col items-center space-y-8"
                  >
                    <img
                      src={`${API_BASE_URL}/storage/${todaysPic.image_url}`}
                      alt={todaysPic.description.name}
                      className="w-[200px] h-auto rounded-md"
                    />
                    <div className="space-y-4 text-center">
                      <motion.h1
                        variants={childVariant}
                        className="text-4xl font-serif text-black text-center"
                      >
                        You've meditated for {formatTime(elapsedTime, true)}
                      </motion.h1>
                      <motion.p
                        variants={childVariant}
                        className="text-gray-600"
                      >
                        Learn more about this art piece
                      </motion.p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={childVariant}
                    className="grid grid-cols-2 gap-x-8 py-8 gap-y-6 max-w-2xl mx-auto text-sm border-t border-b"
                  >
                    <div>
                      <p className="text-gray-500">Title</p>
                      <p className="">
                        {todaysPic.description.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Artist</p>
                      <p className="">
                        {todaysPic.description.artist}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="">
                        {todaysPic.description.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dimensions</p>
                      <p className="">
                        {todaysPic.description.dimensions}
                      </p>
                    </div>
                    <motion.div variants={childVariant} className="col-span-2 max-w-2xl mx-auto">
                      <p className="text-gray-500 text-sm mb-2">About</p>
                      <p className="text-sm leading-relaxed">
                        {todaysPic.description.about}
                      </p>
                    </motion.div>
                    <motion.div variants={childVariant} className="col-span-2">
                      <p className="text-gray-500">Repository</p>
                      <a
                        href={todaysPic.description.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center"
                      >
                        {todaysPic.description.repository}{" "}
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </a>
                    </motion.div>
                  </motion.div>

                  

                  <motion.div variants={childVariant} className="text-center">
                    <Button
                      onClick={resetMeditation}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Return Home
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="imageContent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0 }}
              className={`w-full flex-1 flex ${
                meditationState === "meditating"
                  ? "items-stretch"
                  : "items-center py-12"
              }`}
            >
              {meditationState === "idle" ? (
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
                        onLoad={handleImageLoad}
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
                            onValueChange={(value: string) =>
                              setDuration(value)
                            }
                          >
                            <SelectTrigger className="w-fit min-w-[140px] bg-white/80 backdrop-blur-sm rounded-full">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent className="bg-white/80 backdrop-blur-sm border-input">
                              <SelectItem className="data-[state=checked]:bg-white data-[state=checked]:shadow-sm" value="300">5 minutes</SelectItem>
                              <SelectItem className="data-[state=checked]:bg-white data-[state=checked]:shadow-sm" value="600">10 minutes</SelectItem>
                              <SelectItem className="data-[state=checked]:bg-white data-[state=checked]:shadow-sm" value="900">15 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <motion.div variants={childVariant} className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <p>
                        "{todaysPic.description.name}" (
                        {todaysPic.description.date})
                      </p>
                      <p>{todaysPic.description.artist}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                meditationState === "meditating" && (
                  // Meditating state: image wrapped in a zoom/pan container plus a timer and stop button
                  <div className="relative w-full">
                    <TransformWrapper
                      initialScale={1}
                      minScale={0.8}
                      maxScale={isMobile ? 6 : 4}
                      smooth={true}
                      onPanningStart={() => setHasInteracted(true)}
                      onZoomStart={() => setHasInteracted(true)}
                    >
                      <TransformComponent
                        wrapperClass="!w-full !h-full"
                        contentClass="!w-full !h-full flex items-center justify-center p-8"
                      >
                        <div className="relative bg-white rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.1),0_0_12px_rgba(0,0,0,0.05)] border-[24px] border-white w-fit">
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
                              className={`max-h-[80vh] w-auto rounded-sm transition-opacity duration-300 ${
                                isImageLoaded ? "opacity-100" : "opacity-0"
                              }`}
                              onLoad={handleImageLoad}
                            />
                          </div>
                        </div>
                      </TransformComponent>
                    </TransformWrapper>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Render footer only if not in meditating state or completed state */}
      {meditationState !== "meditating" && meditationState !== "completed" && (
        <footer className="text-center pb-8">
          <p className="text-sm text-gray-600">Picture of the day - Today</p>
        </footer>
      )}
    </div>
  );
}

export default App;
