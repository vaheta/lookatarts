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
          <div className="fixed inset-0 flex items-center justify-center z-30">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-200/90 backdrop-blur-2xl"
              onClick={closeAboutModal}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springTransition}
              className="relative p-8 rounded-lg max-w-md w-full m-4 z-10 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="space-y-8"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={staggerContainerVariant}
              >
                <motion.h2 
                  className="text-4xl font-serif text-center"
                  variants={childVariant}
                >
                  LooksAtArts.com
                </motion.h2>
                <motion.div 
                  className="text-sm text-gray-700 space-y-4"
                  variants={childVariant}
                >
                  <p>
                    We've created this space as an invitation to pause. To look deeply. Whether you have five minutes or fifty, we hope visual meditation with LookAtArts helps you carve out moments of presence in your day through the contemplative power of art.
                  </p>
                  <p>
                    Our project was sparked by a <Button
                      variant="link"
                      className="p-0 h-auto"
                      asChild
                    >
                      <a href="https://www.nytimes.com/interactive/2024/07/20/upshot/attention-experiment.html" target="_blank" rel="noopener noreferrer">
                        New York Times story
                      </a>
                    </Button> about Harvard art history professor Jennifer Roberts, who encourages her students to spend three full hours with a single artwork in a museum. In our fast-paced world, slow, deliberate observation offers a powerful way to re-center and find calm.
                  </p>
                  <p>
                    We hope you enjoy your visual meditation!
                  </p>
                  <p className="italic">
                    ~Two friends with a shared passion for art and meditation
                  </p>
                </motion.div>
                <br/> 
                <motion.div 
                  variants={childVariant}
                >
                  <ThreeDDivider className="my-8" />
                  <p className="text-gray-500 text-center">
                    P.S. Have a feature request or just want to chat? <br/> Say hi at{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
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