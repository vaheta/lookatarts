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

    // Debounce the resize handler to prevent excessive updates
    let resizeTimeout: number | null = null;
    const debouncedSetViewportHeight = () => {
      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout);
      }
      resizeTimeout = window.setTimeout(() => {
        setViewportHeight();
      }, 100);
    };

    // Set the height initially with a slight delay to ensure DOM is fully rendered
    const initialTimer = setTimeout(() => {
      setViewportHeight();
    }, 10);

    // Update again after more time (helps with mobile browser address bar)
    const secondUpdateTimer = setTimeout(() => {
      setViewportHeight();
    }, 300);

    // For mobile browsers that adjust UI elements (like address bars)
    // we need a special handler for scroll events
    let lastWindowHeight = window.innerHeight;
    const handleScroll = () => {
      // Only check/update on significant height changes
      // which indicates the mobile browser UI has changed
      if (Math.abs(window.innerHeight - lastWindowHeight) > 50) {
        lastWindowHeight = window.innerHeight;
        setViewportHeight();
      }
    };

    // Update the height on various events
    window.addEventListener('resize', debouncedSetViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    window.addEventListener('load', setViewportHeight);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', setViewportHeight);
    
    // Also update when the URL changes - this helps with navigation scenarios
    const handleRouteChange = () => {
      // Set immediate and after a delay to catch browser UI changes
      setViewportHeight();
      setTimeout(setViewportHeight, 200);
    };
    
    window.addEventListener('popstate', handleRouteChange);

    // Clean up
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(secondUpdateTimer);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      window.removeEventListener('resize', debouncedSetViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
      window.removeEventListener('load', setViewportHeight);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', setViewportHeight);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return <>{children}</>;
} 