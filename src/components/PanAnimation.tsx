import { motion } from "framer-motion";
import Lottie from "lottie-react";
import panAnimation from "@/assets/PanAnimation.json";

type PanAnimationProps = {
  show: boolean;
  isMobile: boolean;
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

export function PanAnimation({ show, isMobile }: PanAnimationProps) {
  if (!show) return null;

  return (
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
  );
} 