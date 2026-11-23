'use client';

import * as React from 'react';
import { LoadingScreen } from './loading-screen';

export interface HomeLoadingContextValue {
  isReady: boolean;
}

export const HomeLoadingContext = React.createContext<HomeLoadingContextValue>({
  isReady: true,
});

export function useHomeLoading(): HomeLoadingContextValue {
  return React.useContext(HomeLoadingContext);
}

interface HomeLoadingGateProps {
  children: React.ReactNode;
  durationMs?: number;
}

export function HomeLoadingGate({ children, durationMs = 2000 }: HomeLoadingGateProps) {
  const [isDone, setIsDone] = React.useState(false);
  const [isFadingOut, setIsFadingOut] = React.useState(false);

  React.useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Prevent body scrolling while the mandatory loading screen is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let fadeTimer: NodeJS.Timeout | null = null;

    // Mandatory 2-second timer (2000ms)
    const timer = setTimeout(() => {
      if (prefersReducedMotion) {
        setIsDone(true);
        document.body.style.overflow = originalOverflow;
      } else {
        setIsFadingOut(true);
        fadeTimer = setTimeout(() => {
          setIsDone(true);
          document.body.style.overflow = originalOverflow;
        }, 400); // 400ms smooth fade out transition
      }
    }, durationMs);

    return () => {
      clearTimeout(timer);
      if (fadeTimer) clearTimeout(fadeTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [durationMs]);

  const isReady = isFadingOut || isDone;

  return (
    <HomeLoadingContext.Provider value={{ isReady }}>
      {children}
      {!isDone && (
        <div
          className={`fixed inset-0 z-[100] transition-opacity duration-400 ease-out ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-hidden={isFadingOut}
        >
          <LoadingScreen />
        </div>
      )}
    </HomeLoadingContext.Provider>
  );
}
