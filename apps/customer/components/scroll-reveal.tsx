'use client';

import * as React from 'react';
import { cn } from '@qbm/ui';
import { useHomeLoading } from './home-loading-gate';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?:
    | 'fade-up'
    | 'fade-in'
    | 'scale-up'
    | 'card'
    | 'heading'
    | 'description'
    | 'text'
    | 'hero-title'
    | 'hero-subtitle'
    | 'hero-cta';
  delayMs?: number;
}

export function ScrollReveal({
  children,
  className,
  animation = 'fade-up',
  delayMs = 0,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { isReady } = useHomeLoading();

  // Synchronously check prefers-reduced-motion to avoid flash of hidden content
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [isVisible, setIsVisible] = React.useState(prefersReduced);

  React.useEffect(() => {
    if (isVisible || !isReady) return;

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { threshold: 0.05, rootMargin: '60px 0px' },
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [isVisible, isReady]);

  const animationClass =
    animation === 'card'
      ? 'reveal-card'
      : animation === 'heading'
        ? 'reveal-heading'
        : animation === 'description'
          ? 'reveal-description'
          : animation === 'hero-title'
            ? 'reveal-hero-title'
            : animation === 'hero-subtitle'
              ? 'reveal-hero-subtitle'
              : animation === 'hero-cta'
                ? 'reveal-hero-cta'
                : animation === 'text'
                  ? 'reveal-text'
                  : animation === 'fade-in'
                    ? 'reveal-fade-in'
                    : animation === 'scale-up'
                      ? 'reveal-scale-up'
                      : 'reveal-fade-up';

  return (
    <div
      ref={ref}
      className={cn(animationClass, isVisible && 'is-revealed', className)}
      style={{
        transitionDelay: isVisible && delayMs > 0 && !prefersReduced ? `${delayMs}ms` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
