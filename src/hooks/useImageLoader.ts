import { useState } from "react";

export function useImageLoader() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageLoad = () => {
    // Add minimum delay of 100ms before showing image
    setTimeout(() => {
      setIsImageLoaded(true);
    }, 100);
  };

  return {
    isImageLoaded,
    handleImageLoad,
  };
} 