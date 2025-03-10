import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/contexts/UIContext";
import { useEffect } from "react";
import { springTransition, childVariant, staggerContainerVariant } from "../utils/animations";
import { ThreeDDivider } from "@/components/3DDivider";

export function AboutModal() {
  const { isAboutModalOpen, closeAboutModal } = useUI();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isAboutModalOpen) {
      // Save the current body overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';
      
      // Restore original overflow style when modal closes
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isAboutModalOpen]);

  return (
    <>
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="fixed inset-0 flex items-start justify-center z-30 overflow-y-scroll">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-muted/90 backdrop-blur-2xl"
              onClick={closeAboutModal}
            />
            
            {/* Footer gradient background */}
            <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-muted via-muted/80 to-transparent pointer-events-none z-40" />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springTransition}
              className="relative px-8 py-8 rounded-lg max-w-md w-full m-4 z-10 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="flex flex-col items-center max-w-2xl mx-auto space-y-8 px-4 md:px-8 py-10"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={staggerContainerVariant}
              >
                <motion.div
                  className="size-16"
                  variants={childVariant}
                >
                  <svg width="100%" height="100%" viewBox="0 0 116 116" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M115.8 53.1517C115.348 47.6816 114.136 42.4269 112.271 37.4932C100.336 39.1255 88.1767 39.693 76.9222 38.1848C63.8611 36.4345 51.8315 31.8665 42.8022 22.7533C38.3809 18.2909 34.7354 12.7958 32.0414 6.11914C13.0417 15.6442 0 35.2991 0 58C0 63.1915 0.682085 68.2237 1.96153 73.0119C2.87805 64.9965 5.25541 57.7564 10.4365 52.8593C15.9409 47.6565 24.1589 45.5074 35.7454 47.1626C42.799 48.1702 50.2915 49.6642 57.7805 51.1575L57.7817 51.1578C62.2199 52.0427 66.6569 52.9274 71.0005 53.7105C82.8149 55.8404 94.0945 57.2552 103.773 56.2229C108.188 55.7519 112.222 54.7782 115.8 53.1517ZM5.7485 83.2056C9.60195 91.1792 15.2268 98.1366 22.1121 103.567C23.5408 98.5432 25.8896 93.9512 29.5647 90.1133C35.2956 84.1285 43.9827 80.2567 56.5966 79.1598C65.6427 78.3732 74.1838 78.4919 81.8979 78.5992C83.9089 78.6271 85.8637 78.6543 87.7565 78.6644C97.0334 78.7141 104.705 78.3488 110.794 75.9612C111.756 75.584 112.682 75.1547 113.57 74.6645C115.151 69.3864 116 63.7924 116 58C116 57.9006 116 57.8013 115.999 57.702C112.35 59.148 108.389 60.0228 104.226 60.4669C93.8978 61.5685 82.1032 60.049 70.2432 57.9109C65.7221 57.0958 61.2115 56.1956 56.7478 55.3048L56.7477 55.3048L56.7476 55.3047L56.7474 55.3047C49.3624 53.8309 42.1057 52.3826 35.1418 51.3878C24.3208 49.8419 17.6005 51.9609 13.3682 55.9611C9.05559 60.0374 6.87183 66.4808 6.09032 74.5557C5.82392 77.3082 5.72428 80.2069 5.7485 83.2056ZM110.549 33.4185C101.297 13.6747 81.2453 0 58 0C50.1858 0 42.7326 1.5453 35.9292 4.34697C38.4414 10.6331 41.8189 15.6967 45.8341 19.7493C53.9943 27.9854 65.0249 32.2842 77.4891 33.9545C87.9543 35.357 99.298 34.8908 110.549 33.4185ZM111.591 80.2215C104.792 82.6816 96.6219 82.9801 87.7337 82.9324C85.7751 82.9219 83.7757 82.8943 81.7359 82.8662C74.0427 82.7599 65.7761 82.6458 56.9664 83.4118C45.0385 84.449 37.4533 88.0464 32.6474 93.0652C29.2034 96.6618 27.049 101.131 25.8175 106.26C35.0258 112.413 46.094 116 58 116C82.1606 116 102.871 101.227 111.591 80.2215Z" fill="#5C5B4F"/>
                  </svg>
                </motion.div>
                <motion.h2 
                  className="text-4xl font-serif text-center italic"
                  variants={childVariant}
                >
                  LookAtArts
                </motion.h2>
                <motion.div 
                  className="text-foreground space-y-4"
                  variants={childVariant}
                >
                  <p>
                    We've created this space as an invitation to pause. To look deeply. Whether you have five minutes or fifty, we hope visual meditation can help you carve out moments of presence in your day through the contemplative power of art.
                  </p>
                  <p>
                    Our project was sparked by a <a 
                      href="https://www.nytimes.com/interactive/2024/07/20/upshot/attention-experiment.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground border-dotted border-b border-foreground hover:border-solid transition-all"
                    >
                      New York Times story
                    </a> about Harvard art history professor Jennifer Roberts, who encourages her students to spend three full hours with a single artwork in a museum. In our fast-paced world, slow, deliberate observation offers a powerful way to re-center and find calm.
                  </p>
                  <p>
                    We hope you enjoy your visual meditation!
                  </p>
                  <p className="italic">
                    ~Two friends with a shared passion for art and meditation
                  </p>
                </motion.div>
                <ThreeDDivider className="my-4" />
                <motion.div 
                  variants={childVariant}
                > 
                  <p className="text-muted-foreground text-center">
                    P.S. Have a feature request or just want to chat? <br/> Say hi at{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-md "
                      asChild
                    >
                      <a href="mailto:hello@lookatarts.com">
                        hello@lookatarts.com{" "}
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </a>
                    </Button>
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 