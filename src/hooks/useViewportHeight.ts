import { useEffect } from 'react';

/**
 * Hook to set CSS custom properties for accurate viewport height on mobile
 * This solves issues with 100vh on mobile browsers (especially iOS Safari)
 * where the browser UI takes up space but is included in the viewport height.
 */
export function useViewportHeight() {
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

    // Set the height initially
    setViewportHeight();

    // Update the height on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Clean up
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
} 