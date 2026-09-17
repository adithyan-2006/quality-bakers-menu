'use client';

import * as React from 'react';
import { cn } from '@qbm/ui';
import type { AnimationConfig } from '../types';

interface MotionWrapperProps {
  children: React.ReactNode;
  config?: AnimationConfig;
  /** Stagger index — used to calculate non-accumulating row stagger */
  index?: number;
  className?: string;
  variant?: 'card' | 'heading' | 'description';
  delayMs?: number;
}

/**
 * Motion Wrapper — Client Component
 *
 * Provides high-performance, GPU-accelerated reveal animations:
 * - 'card': Premium vertical rise + subtle scale reveal with non-accumulating stagger
 * - 'heading': Editorial vertical rise when entering viewport
 * - 'description': Editorial vertical rise with controlled delay after heading
 *
 * Uses IntersectionObserver to trigger hardware-accelerated CSS transitions.
 * Disconnects observer once revealed to guarantee no repeated animation bugs.
 * Respects prefers-reduced-motion synchronously.
 */
export function MotionWrapper({
  children,
  config: _config,
  index = 0,
  className,
  variant = 'card',
  delayMs,
}: MotionWrapperProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Synchronously check prefers-reduced-motion to avoid flash of hidden content
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [isVisible, setIsVisible] = React.useState(prefersReduced);

  React.useEffect(() => {
    if (isVisible) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '60px 0px' },
    );

    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [isVisible]);

  // Determine animation style class
  const animationClass =
    variant === 'heading'
      ? 'reveal-heading'
      : variant === 'description'
        ? 'reveal-description'
        : 'reveal-card';

  // Calculate stagger delay:
  // For cards: (index % 4) * 70ms (0ms, 70ms, 140ms, 210ms) - never accumulates indefinitely.
  // For explicit delayMs: use delayMs.
  // For heading: 0ms.
  // For description: default 120ms (~100-150ms after heading).
  const resolvedDelay =
    delayMs !== undefined
      ? delayMs
      : variant === 'description'
        ? 120
        : variant === 'heading'
          ? 0
          : (index % 4) * 70;

  return (
    <div
      ref={ref}
      className={cn(animationClass, isVisible && 'is-revealed', className)}
      style={
        resolvedDelay > 0 && !prefersReduced
          ? { transitionDelay: isVisible ? `${resolvedDelay}ms` : '0ms' }
          : undefined
      }
    >
      {children}
    </div>
  );
}
