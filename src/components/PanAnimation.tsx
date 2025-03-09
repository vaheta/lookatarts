import { motion } from "framer-motion";
import Lottie from "lottie-react";
import panAnimation from "@/assets/PanAnimation.json";
import { childVariant, staggerContainerVariant } from "@/utils/animations";

type PanAnimationProps = {
  show: boolean;
  isMobile: boolean;
};

export function PanAnimation({ show, isMobile }: PanAnimationProps) {
  if (!show) return null;

  return (
    <motion.div
      variants={staggerContainerVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
    >
      <motion.div 
        variants={childVariant}
        className="w-20 h-20 relative"
      >
        <Lottie 
          animationData={panAnimation} 
          loop={true}
          style={{ filter: 'brightness(0) invert(1)' }} 
          className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4"
        />
      </motion.div>
      <motion.p
        variants={childVariant}
        className="text-lg font-base text-white mix-blend-difference"
      >
        {isMobile ? "Pinch and pan to explore details." : "Zoom and pan with your mouse to explore details."}
      </motion.p>
    </motion.div>
  );
} 