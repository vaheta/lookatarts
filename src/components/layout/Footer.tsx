import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/contexts/UIContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const { isAboutModalOpen, openAboutModal, closeAboutModal } = useUI();
  
  const handleToggleModal = () => {
    if (isAboutModalOpen) {
      closeAboutModal();
    } else {
      openAboutModal();
    }
  };

  return (
    <footer className={`text-center py-8 ${className} relative z-40`}>
      <div className="flex items-center justify-center gap-3 bottom-4 left-1/2 z-50">
        <ThemeToggle />
        
        <Button
          onClick={handleToggleModal}
          variant={isAboutModalOpen ? "outline" : "outline"}
          size={isAboutModalOpen ? "icon" : "sm"}
          className={`${isAboutModalOpen ? 'dark' : ''} ${isAboutModalOpen ? 'h-9 w-9 rounded-full' : 'px-4 py-2 rounded-full'} text-foreground bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-none hover:shadow-xl transition-all duration-300 ease-in-out transform  motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
        >
          {isAboutModalOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1.5">
              {/* <Info className="w-4 h-4" /> */}
              <span>About project</span>
            </div>
          )}
        </Button>
      </div>
    </footer>
  );
} 