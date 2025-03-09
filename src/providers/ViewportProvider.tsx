import { ReactNode, useEffect } from 'react';

interface ViewportProviderProps {
  children: ReactNode;
}

/**
 * Global provider that handles viewport height calculations once at app startup
 * This prevents recalculations and flickering during page transitions
 */
export function ViewportProvider({ children }: ViewportProviderProps) {
  useEffect(() => {
    // Function to update the custom property
    function setViewportHeight() {
      // Get the viewport height and multiply by 1% to get a value for 1vh unit
      const vh = window.innerHeight * 0.01;
      // Set the value in the --vh custom property
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Optionally set header and footer heights if they exist
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      
      if (header) {
        document.documentElement.style.setProperty(
          '--header-height', 
          `${header.offsetHeight}px`
        );
      }
      
      if (footer) {
        document.documentElement.style.setProperty(
          '--footer-height', 
          `${footer.offsetHeight}px`
        );
      }
    }

    // Set the height initially with a slight delay to ensure DOM is fully rendered
    const initialTimer = setTimeout(() => {
      setViewportHeight();
    }, 10);

    // Update the height on resize, orientation change, and load
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    window.addEventListener('load', setViewportHeight); // Added load event listener

    // Clean up
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('load', setViewportHeight); // Added cleanup for load event listener
    };
  }, []);

  return <>{children}</>;
} 