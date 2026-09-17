'use client';

import * as React from 'react';
import { cn } from '@qbm/ui';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'scale-up' | 'card' | 'heading' | 'description';
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

  // Synchronously check prefers-reduced-motion to avoid flash of hidden content
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [isVisible, setIsVisible] = React.useState(prefersReduced);

  React.useEffect(() => {
    if (isVisible) return;

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
      { threshold: 0.1, rootMargin: '60px 0px' },
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [isVisible]);

  const animationClass =
    animation === 'card'
      ? 'reveal-card'
      : animation === 'heading'
        ? 'reveal-heading'
        : animation === 'description'
          ? 'reveal-description'
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
