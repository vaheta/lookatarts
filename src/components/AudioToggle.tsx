import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music, Volume1, Cloud, Waves, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio, AudioTrack } from "@/contexts/AudioContext";

export function AudioToggle() {
  const { isPlaying, currentTrack, toggleAudio, setTrack, showDropdown, setShowDropdown } = useAudio();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowDropdown]);

  // Get the appropriate icon based on state
  const getIcon = () => {
    if (showDropdown) {
      // When menu is open, show X icon for close
      return <VolumeX className="w-4 h-4" />;
    } else if (!isPlaying || currentTrack === "none") {
      return <VolumeX className="w-4 h-4" />;
    } else {
      return <Volume2 className="w-4 h-4" />;
    }
  };

  // Track names for display
  const trackNames = {
    ambient: "Ambient Morning",
    rain: "Summer Rain",
    tone: "3 Hz Tone",
    water: "Old Water",
    none: "No Sound"
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Track Selection Dropdown - Positioned ABOVE the button */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, x:"-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x:"-50%", scale: 1 }}
            exit={{ opacity: 0, y: 10, x:"-50%", scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 max-w-[90vw] bg-background/95 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-50 border border-border"
          >
            <div className="p-2">
              <TrackOption 
                label="Ambient Morning" 
                description="Soft, calming ambient melodies"
                isActive={currentTrack === "ambient" && isPlaying} 
                onClick={() => {
                  setTrack("ambient");
                  setShowDropdown(false);
                }} 
                icon={<Music className="w-4 h-4 mr-2" />}
              />
              
              <TrackOption 
                label="Summer Rain" 
                description="Gentle rain sounds for relaxation"
                isActive={currentTrack === "rain" && isPlaying} 
                onClick={() => {
                  setTrack("rain");
                  setShowDropdown(false);
                }} 
                icon={<Cloud className="w-4 h-4 mr-2" />}
              />
              
              <TrackOption 
                label="3 Hz Tone" 
                description="Binaural beat for deep meditation"
                isActive={currentTrack === "tone" && isPlaying} 
                onClick={() => {
                  setTrack("tone");
                  setShowDropdown(false);
                }} 
                icon={<Radio className="w-4 h-4 mr-2" />}
              />
              
              <TrackOption 
                label="Old Water" 
                description="Flowing water and natural ambience"
                isActive={currentTrack === "water" && isPlaying} 
                onClick={() => {
                  setTrack("water");
                  setShowDropdown(false);
                }} 
                icon={<Waves className="w-4 h-4 mr-2" />}
              />
              
              <div className="my-1 border-t border-border/40"></div>
              
              <TrackOption 
                label="No Sound" 
                description={undefined}
                isActive={!isPlaying || currentTrack === "none"} 
                onClick={() => {
                  setTrack("none");
                  setShowDropdown(false);
                }} 
                icon={<VolumeX className="w-4 h-4 mr-2" />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Toggle Button */}
      <Button
        onClick={() => {
          if (showDropdown) {
            // If menu is open, close it without changing sound
            setShowDropdown(false);
          } else if (isPlaying && !showDropdown) {
            // If sound is playing and menu is closed, open the menu
            setShowDropdown(true);
          } else {
            // Otherwise toggle audio as before
            toggleAudio();
          }
        }}
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-none hover:shadow-xl transition-all duration-300 ease-in-out transform motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        aria-label={showDropdown ? "Close sound menu" : (isPlaying ? "Sound options" : "Turn sound on")}
      >
        <motion.div
          initial={{ opacity: 0, rotate: -30 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 30 }}
          transition={{ duration: 0.3 }}
          className="relative w-4 h-4"
        >
          {getIcon()}
        </motion.div>
      </Button>
    </div>
  );
}

// Helper component for track options
function TrackOption({ 
  label, 
  description,
  isActive, 
  onClick, 
  icon 
}: { 
  label: string;
  description?: string;
  isActive: boolean; 
  onClick: () => void; 
  icon: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-start transition-colors ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-muted text-foreground"
      }`}
    >
      <div className="flex items-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      {isActive && (
        <motion.div 
          layoutId="activeTrack"
          className="ml-auto h-2 w-2 rounded-full bg-primary mt-1" 
        />
      )}
    </button>
  );
} 