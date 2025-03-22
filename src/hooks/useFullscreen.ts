import { useCallback } from 'react';

export type FullscreenError = {
  name: string;
  message: string;
};

export function useFullscreen() {
  const requestFullscreen = useCallback((element: HTMLElement) => {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen();
    }
    return Promise.reject({ 
      name: 'FullscreenError',
      message: 'Fullscreen API not supported'
    } as FullscreenError);
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      return (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      return (document as any).msExitFullscreen();
    }
    return Promise.reject({ 
      name: 'FullscreenError',
      message: 'Fullscreen API not supported'
    } as FullscreenError);
  }, []);

  const isFullscreen = useCallback(() => {
    return !!(
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).mozFullScreenElement || 
      (document as any).msFullscreenElement
    );
  }, []);

  return {
    requestFullscreen,
    exitFullscreen,
    isFullscreen
  };
} 