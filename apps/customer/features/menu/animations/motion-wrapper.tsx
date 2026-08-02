'use client';

import * as React from 'react';
import { cn } from '@qbm/ui';
import type { AnimationConfig } from '../types';

interface MotionWrapperProps {
  children: React.ReactNode;
  config: AnimationConfig;
  /** Stagger index — only relevant if config.isStaggered is true */
  index?: number;
  className?: string;
}

/**
 * Motion Wrapper — Client Component
 *
 * The ONLY client component responsible for Level 1 CSS animations.
 * Uses IntersectionObserver to trigger hardware-accelerated CSS classes.
 *
 * Receives AnimationConfig (resolved by AnimationEngine on the server).
 * Has no knowledge of categories, layouts, or themes.
 *
 * Respects prefers-reduced-motion: if enabled, renders children
 * immediately without animation.
 *
 * Level 2 (immersive scroll effects) are NOT implemented here.
 * They will live in isolated, dynamically imported section components
 * (next/dynamic) that never affect this component or the main bundle.
 */
export function MotionWrapper({ children, config, index = 0, className }: MotionWrapperProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // FIX 4: Read prefers-reduced-motion synchronously before first render.
  // Previously this was read inside useEffect, which fires after the first
  // paint — causing reduced-motion users to see a brief invisible frame.
  // We initialize state from the media query directly so the first render
  // is already correct. The typeof guard makes this SSR-safe.
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // isVisible starts true for reduced-motion users (no animation needed)
  // and false for normal users (will be set true by IntersectionObserver)
  const [isVisible, setIsVisible] = React.useState(prefersReduced || config.enterClass === '');

  React.useEffect(() => {
    // Already visible — skip observer entirely
    if (isVisible) return;

    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (el) observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '80px 0px' },
    );

    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
    // isVisible intentionally excluded from deps — we only want to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const delayMs = config.isStaggered && !prefersReduced ? index * config.staggerDelayMs : 0;

  return (
    <div
      ref={ref}
      className={cn(
        'will-change-transform motion-reduce:will-change-auto',
        // Hidden before visible (only for users with animations enabled)
        !isVisible ? 'opacity-0' : '',
        // Apply enter animation once visible (skipped for reduced-motion users)
        isVisible && !prefersReduced && config.enterClass ? config.enterClass : '',
        // Ensure opacity is fully restored when visible
        isVisible ? 'opacity-100' : '',
        className,
      )}
      style={
        delayMs > 0 ? { animationDelay: `${delayMs}ms`, animationFillMode: 'forwards' } : undefined
      }
    >
      {children}
    </div>
  );
}
