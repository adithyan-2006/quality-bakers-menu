'use client';

import React, { useEffect, useState } from 'react';

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export const BAKERY_QUOTES: Record<TimePeriod, string[]> = {
  morning: [
    'The morning ovens are warm, and the first loaves are rising.',
    'Dawn brings the sweet aroma of freshly baked beginnings.',
    'Golden crusts and fresh coffee — morning done right.',
    'Kneaded with care before the sunrise.',
    'Crisp morning air, fresh from our oven to your hands.',
    'Every good morning starts with warm flour and honest craft.',
  ],
  afternoon: [
    'Golden afternoon treats, freshly pulled from the hearth.',
    'Pause your day for something sweet and comforting.',
    'The ovens never rest — warm cakes ready for the midday.',
    'Freshly baked delights to brighten your afternoon.',
    'A warm afternoon slice makes every moment better.',
    'Flaky pastries and sweet layers, crafted for your break.',
  ],
  evening: [
    'Golden crusts cooling softly as the day winds down.',
    'Evening sweetness to share with those you cherish.',
    'The comforting warmth of freshly baked goodness after dusk.',
    'Sweet finish to an honest day’s journey.',
    'Warm treats and gentle evenings made to savor.',
    'Evenings taste sweetest with fresh crumb and cream.',
  ],
  night: [
    'Quiet night whispers while tomorrow’s dough rests.',
    'Under starlight, the sourdough slowly ferments.',
    'Silent ovens cooling while tomorrow’s sweetness dreams.',
    'Patience and quiet rest bring tomorrow’s finest crust.',
    'In the stillness of the night, great baking takes time.',
    'Midnight peace while the hearth gathers its warmth.',
  ],
};

/**
 * Determines the time period based on visitor's local hour:
 * - Morning: 5 AM – 11 AM (5 <= hour < 11)
 * - Afternoon: 11 AM – 5 PM (11 <= hour < 17)
 * - Evening: 5 PM – 9 PM (17 <= hour < 21)
 * - Night: 9 PM – 5 AM (hour >= 21 || hour < 5)
 */
export function getTimePeriod(date: Date = new Date()): TimePeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Randomly selects a quote from the specified period,
 * guaranteeing no consecutive repetitions when alternatives exist.
 */
export function getRandomQuote(period: TimePeriod, previousQuote?: string): string {
  const quotes = BAKERY_QUOTES[period];
  if (!quotes || quotes.length === 0) return '';
  const candidates =
    previousQuote && quotes.length > 1 ? quotes.filter((q) => q !== previousQuote) : quotes;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? quotes[0] ?? '';
}

export interface LoadingScreenProps {
  forcedPeriod?: TimePeriod;
  forcedHour?: number;
  rotationIntervalMs?: number;
  className?: string;
}

export function LoadingScreen({
  forcedPeriod,
  forcedHour,
  rotationIntervalMs = 5000,
  className = '',
}: LoadingScreenProps) {
  const [currentQuote, setCurrentQuote] = useState<string>(() => {
    let period: TimePeriod;
    if (forcedPeriod) {
      period = forcedPeriod;
    } else if (typeof forcedHour === 'number') {
      const mockDate = new Date();
      mockDate.setHours(forcedHour, 0, 0, 0);
      period = getTimePeriod(mockDate);
    } else {
      period = getTimePeriod();
    }
    return getRandomQuote(period);
  });
  const [isFading, setIsFading] = useState<boolean>(false);

  // Synchronize state during render if forced props change (pattern: https://react.dev/learn/you-might-not-need-an-effect)
  const [prevPeriodKey, setPrevPeriodKey] = useState<string>(() => `${forcedPeriod}_${forcedHour}`);
  const currentPeriodKey = `${forcedPeriod}_${forcedHour}`;
  if (prevPeriodKey !== currentPeriodKey) {
    setPrevPeriodKey(currentPeriodKey);
    let period: TimePeriod;
    if (forcedPeriod) {
      period = forcedPeriod;
    } else if (typeof forcedHour === 'number') {
      const mockDate = new Date();
      mockDate.setHours(forcedHour, 0, 0, 0);
      period = getTimePeriod(mockDate);
    } else {
      period = getTimePeriod();
    }
    setCurrentQuote(getRandomQuote(period));
  }

  useEffect(() => {
    let period: TimePeriod;
    if (forcedPeriod) {
      period = forcedPeriod;
    } else if (typeof forcedHour === 'number') {
      const mockDate = new Date();
      mockDate.setHours(forcedHour, 0, 0, 0);
      period = getTimePeriod(mockDate);
    } else {
      period = getTimePeriod();
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Timer references for clean disposal on unmount
    let fadeTimeout: NodeJS.Timeout | null = null;
    let rotationInterval: NodeJS.Timeout | null = null;

    rotationInterval = setInterval(() => {
      if (prefersReducedMotion) {
        setCurrentQuote((prev) => getRandomQuote(period, prev));
      } else {
        // Smooth 300ms fade transition without touching the CSS circles animation
        setIsFading(true);
        fadeTimeout = setTimeout(() => {
          setCurrentQuote((prev) => getRandomQuote(period, prev));
          setIsFading(false);
        }, 300);
      }
    }, rotationIntervalMs);

    return () => {
      if (rotationInterval) clearInterval(rotationInterval);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [forcedPeriod, forcedHour, rotationIntervalMs]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#BC1D1A] px-6 select-none ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Quality Bakers menu"
    >
      {/* Screen reader only announcement */}
      <span className="sr-only">Loading Quality Bakers menu...</span>

      {/* Four hollow cream circles filling sequentially */}
      <div className="flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-3 w-3 rounded-full border-[1.5px] border-[#FDFADB]/70 animate-circle-fill-1" />
        <span className="h-3 w-3 rounded-full border-[1.5px] border-[#FDFADB]/70 animate-circle-fill-2" />
        <span className="h-3 w-3 rounded-full border-[1.5px] border-[#FDFADB]/70 animate-circle-fill-3" />
        <span className="h-3 w-3 rounded-full border-[1.5px] border-[#FDFADB]/70 animate-circle-fill-4" />
      </div>

      {/* Elegant cream-coloured bakery quote beneath circles */}
      <div className="mt-8 flex min-h-[4.5rem] items-center justify-center max-w-sm sm:max-w-md md:max-w-lg text-center px-4">
        <p
          suppressHydrationWarning
          className={`font-sans font-medium text-base sm:text-lg md:text-xl text-[#FDFADB] tracking-wide leading-relaxed transition-opacity duration-300 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {currentQuote ? `“${currentQuote}”` : ''}
        </p>
      </div>
    </div>
  );
}
