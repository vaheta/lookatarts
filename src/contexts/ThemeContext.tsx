import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  usingSystemTheme: boolean;
  resetToSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Check if theme exists in localStorage
  const hasStoredTheme = typeof window !== 'undefined' && localStorage.getItem("theme") !== null;
  
  // State to track if user is using system preference or manual preference
  const [usingSystemTheme, setUsingSystemTheme] = useState<boolean>(!hasStoredTheme);
  
  // Function to detect system theme
  const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') return "light";
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
  };

  // Initialize theme state
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return "light";
    
    // Use stored theme if it exists
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Otherwise use system theme
    return getSystemTheme();
  });

  // Apply theme class to document
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Only save to localStorage if not using system theme
    if (!usingSystemTheme) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, usingSystemTheme]);

  // Setup system theme detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only track system theme if user is using system preference
    if (!usingSystemTheme) return;
    
    // Function to check system theme and update if needed
    const checkSystemTheme = () => {
      const systemTheme = getSystemTheme();
      setTheme(systemTheme);
    };
    
    // Set up media query
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check on changes using all available methods
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', checkSystemTheme);
    } else if (darkModeMediaQuery.addListener) {
      // For older browsers including older Safari
      darkModeMediaQuery.addListener(checkSystemTheme);
    }
    
    // For iOS, check on visibility change and focus
    document.addEventListener('visibilitychange', checkSystemTheme);
    window.addEventListener('focus', checkSystemTheme);
    
    // Additional fallback for iOS: poll for changes every second
    const intervalId = setInterval(checkSystemTheme, 1000);

    return () => {
      // Clean up
      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', checkSystemTheme);
      } else if (darkModeMediaQuery.removeListener) {
        darkModeMediaQuery.removeListener(checkSystemTheme);
      }
      document.removeEventListener('visibilitychange', checkSystemTheme);
      window.removeEventListener('focus', checkSystemTheme);
      clearInterval(intervalId);
    };
  }, [usingSystemTheme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setUsingSystemTheme(false);
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Set theme and mark as manually set
  const setThemeWithPreference = (newTheme: Theme) => {
    setUsingSystemTheme(false);
    setTheme(newTheme);
  };

  // Function to reset to system theme
  const resetToSystemTheme = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem("theme");
    setUsingSystemTheme(true);
    setTheme(getSystemTheme());
  };

  // Use this to programmatically check if system theme has changed
  useEffect(() => {
    if (usingSystemTheme) {
      // Immediately check on mount and after any visibility changes
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          setTheme(getSystemTheme());
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [usingSystemTheme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme: setThemeWithPreference,
      usingSystemTheme,
      resetToSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
} 