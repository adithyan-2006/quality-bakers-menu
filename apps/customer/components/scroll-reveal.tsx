'use client';

import * as React from 'react';
import { cn } from '@qbm/ui';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'scale-up';
  delayMs?: number;
}

export function ScrollReveal({
  children,
  className,
  animation = 'fade-up',
  delayMs = 0,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (currentRef) observer.unobserve(currentRef);
        }
      },
      { threshold: 0.15, rootMargin: '50px' },
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const animationClasses = {
    'fade-up':
      'animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out fill-mode-forwards',
    'fade-in': 'animate-in fade-in duration-1000 ease-out fill-mode-forwards',
    'scale-up': 'animate-in fade-in zoom-in-[0.98] duration-1000 ease-out fill-mode-forwards',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'will-change-transform motion-reduce:will-change-auto',
        !isVisible ? 'opacity-0' : animationClasses[animation],
        className,
      )}
      style={{ animationDelay: isVisible ? `${delayMs}ms` : '0ms' }}
      {...props}
    >
      {children}
    </div>
  );
}
