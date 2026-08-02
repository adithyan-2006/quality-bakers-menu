'use client';

import * as React from 'react';
import { cn } from '@qbm/ui';

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm transition-shadow duration-300',
        isScrolled ? 'shadow-sm' : '',
        'h-[68px] flex flex-col justify-center px-4 md:px-8',
      )}
    >
      {children}
    </header>
  );
}
