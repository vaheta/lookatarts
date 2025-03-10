import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the track options based on actual files
export type AudioTrack = "ambient" | "rain" | "tone" | "water" | "none";

// Define the context type
interface AudioContextType {
  isPlaying: boolean;
  currentTrack: AudioTrack;
  toggleAudio: () => void;
  setTrack: (track: AudioTrack) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  isLoading: boolean;
}

// Create the context
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Define audio file paths using the actual file names
const audioTracks = {
  ambient: "/audio/Ambient Morning.mp3",
  rain: "/audio/Summer Rain.mp3",
  tone: "/audio/3 hz tone.mp3",
  water: "/audio/Old Water.mp3",
};

// Create the provider component
export function AudioProvider({ children }: { children: ReactNode }) {
  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>("none");
  const [showDropdown, setShowDropdown] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.6; // Set default volume to 60%
    
    // Add event listeners for loading states
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('error', () => {
      console.error("Error loading audio");
      setIsLoading(false);
    });
    
    setAudioElement(audio);

    // Cleanup on unmount
    return () => {
      audio.removeEventListener('loadstart', () => setIsLoading(true));
      audio.removeEventListener('canplay', () => setIsLoading(false));
      audio.removeEventListener('error', () => setIsLoading(false));
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    if (!audioElement || currentTrack === "none") return;
    
    // Update the audio source when track changes
    const trackPath = audioTracks[currentTrack];
    if (trackPath) {
      setIsLoading(true);
      audioElement.src = trackPath;
      
      // If was playing before track change, continue playing new track
      if (isPlaying) {
        audioElement.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }
    
    // Save preference to localStorage
    localStorage.setItem("meditationTrack", currentTrack);
  }, [currentTrack, audioElement, isPlaying]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioElement) return;
    
    if (isPlaying && currentTrack !== "none") {
      setIsLoading(true);
      audioElement.play().catch(err => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement, currentTrack]);

  // Toggle audio playback
  const toggleAudio = () => {
    if (currentTrack === "none") {
      // If no track selected, just show dropdown without changing playback state
      setShowDropdown(true);
    } else if (!isPlaying) {
      // If turning on, play current track
      setIsPlaying(true);
    } else {
      // If turning off, pause
      setIsPlaying(false);
    }
  };

  // Set the current track
  const setTrack = (track: AudioTrack) => {
    setCurrentTrack(track);
    if (track === "none") {
      setIsPlaying(false);
      setIsLoading(false);
    } else if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider 
      value={{ 
        isPlaying, 
        currentTrack, 
        toggleAudio, 
        setTrack,
        showDropdown,
        setShowDropdown,
        isLoading
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

// Create a custom hook for using the audio context
export function useAudio() {
  const context = useContext(AudioContext);
  
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  
  return context;
} 