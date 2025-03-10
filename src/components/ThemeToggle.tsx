import { Square, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-none hover:shadow-xl transition-all duration-300 ease-in-out transform motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={{ opacity: 0, rotate: -30 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 30 }}
        transition={{ duration: 0.3 }}
        className="relative w-4 h-4"
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </motion.div>
    </Button>
  );
} 