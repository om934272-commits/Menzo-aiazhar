import { useState, useEffect, useRef } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouch: boolean;
  prefersReducedMotion: boolean;
}

export function useResponsive() {
  const [state, setState] = useState<ResponsiveState>({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    breakpoint: "desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isWide: false,
    isPortrait: true,
    isLandscape: false,
    isTouch: false,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isDesktop = width >= 1024 && width < 1440;
      const isWide = width >= 1440;
      
      let breakpoint: Breakpoint = "desktop";
      if (isMobile) breakpoint = "mobile";
      else if (isTablet) breakpoint = "tablet";
      else if (isWide) breakpoint = "wide";

      setState({
        width,
        height,
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
        isWide,
        isPortrait: height > width,
        isLandscape: width > height,
        isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
    };

    updateState();
    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, []);

  return state;
}

export function useWindowSize(debounceMs = 150) {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, debounceMs);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [debounceMs]);

  return size;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
