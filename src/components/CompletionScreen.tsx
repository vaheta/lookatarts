import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Info } from "lucide-react";
import { API_BASE_URL } from "@/config";
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
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
    }
  }
};

export function CompletionScreen() {
  const { todaysPic, formattedTime, resetMeditation, elapsedTime, duration } = useMeditation();

  if (!todaysPic) return null;
  
  // Calculate percentage of planned time completed
  const plannedTimeInSeconds = parseInt(duration);
  const percentageCompleted = plannedTimeInSeconds > 0 
    ? Math.round((elapsedTime / plannedTimeInSeconds) * 100) 
    : 0;

  return (
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
                You've meditated for {formattedTime}
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
  );
} 