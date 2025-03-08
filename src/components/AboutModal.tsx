import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/contexts/UIContext";
import { useEffect } from "react";

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
    <AnimatePresence>
      {isAboutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-lg"
            onClick={closeAboutModal}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative p-8 rounded-lg max-w-md w-full m-4 z-10 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-serif">About Us</h2>
              <p className="text-sm text-gray-700">
                This is a placeholder for the About Us content. We will work on the actual content later.
              </p>
            </div>
            
            <div className="mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={closeAboutModal}
                className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 text-xs h-8"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 