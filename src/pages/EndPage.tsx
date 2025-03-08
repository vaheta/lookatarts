import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { useMeditation } from "@/contexts/MeditationContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { childVariant, staggerContainerVariant } from "@/utils/animations";

export function EndPage() {
  const { todaysPic, resetMeditation, elapsedTime, duration, formatElapsedTime } = useMeditation();

  if (!todaysPic) return null;
  
  // Calculate percentage of planned time completed
  const plannedTimeInSeconds = parseInt(duration);
  const percentageCompleted = plannedTimeInSeconds > 0 
    ? Math.round((elapsedTime / plannedTimeInSeconds) * 100) 
    : 0;

  return (
    <MainLayout>
      <motion.div
        key="completed"
        initial="hidden"
        animate="visible"
        variants={staggerContainerVariant}
        className="w-full flex-1 flex items-center"
      >
        <div className="max-w-5xl mx-auto px-4 py-8 w-full">
          <motion.div
            variants={staggerContainerVariant}
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
                  You've meditated for {formatElapsedTime()}
                </motion.h1>
                <motion.p
                  variants={childVariant}
                  className="text-gray-600"
                >
                  {percentageCompleted}% of planned session
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              variants={childVariant}
              className="grid grid-cols-2 gap-x-8 py-8 gap-y-6 max-w-2xl mx-auto text-sm border-t border-b"
            >
              {todaysPic.description.name && (
                <div>
                  <p className="text-gray-500">Title</p>
                  <p className="">
                    {todaysPic.description.name}
                  </p>
                </div>
              )}
              {todaysPic.description.artist && (
                <div>
                  <p className="text-gray-500">Artist</p>
                  <p className="">
                    {todaysPic.description.artist}
                  </p>
                </div>
              )}
              {todaysPic.description.date && (
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="">
                    {todaysPic.description.date}
                  </p>
                </div>
              )}
              {todaysPic.description.dimensions && (
                <div>
                  <p className="text-gray-500">Dimensions</p>
                  <p className="">
                    {todaysPic.description.dimensions}
                  </p>
                </div>
              )}
              {todaysPic.description.about && (
                <motion.div variants={childVariant} className="col-span-2 max-w-2xl mx-auto">
                  <p className="text-gray-500 text-sm mb-2">About</p>
                  <p className="text-sm leading-relaxed">
                    {todaysPic.description.about}
                  </p>
                </motion.div>
              )}
              {todaysPic.description.repository && (
                <motion.div variants={childVariant} className="col-span-2">
                  <p className="text-gray-500">Repository</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    asChild
                  >
                    <a 
                      href={todaysPic.description.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {todaysPic.description.repository}{" "}
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                </motion.div>
              )}
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
    </MainLayout>
  );
} 