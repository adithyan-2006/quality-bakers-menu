'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@qbm/ui';
import { MobileNav } from './mobile-nav';
import { ContentContainer } from './layout/content-container';

interface ScrollHeaderProps {
  businessName?: string;
  logoUrl?: string | null;
  children?: React.ReactNode;
}

export function ScrollHeader({
  businessName = 'Quality Bakers',
  logoUrl,
  children,
}: ScrollHeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      const currentY = window.scrollY;
      setIsScrolled((prev) => {
        // Hysteresis: shrink when scrolling down past 50px, expand when returning to < 15px.
        // This prevents layout oscillation caused by header expansion pushing content down.
        if (!prev && currentY > 50) return true;
        if (prev && currentY < 15) return false;
        return prev;
      });
      rafId = null;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    // Initial check
    update();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-brand-dark/95 backdrop-blur-md transition-all duration-300 ease-out',
        isScrolled
          ? 'h-[52px] md:h-[64px] border-b border-border/80 shadow-md py-1 md:py-1.5'
          : 'h-[64px] md:h-[80px] border-b border-transparent py-2 md:py-3',
        'flex flex-col justify-center px-4 md:px-8',
      )}
    >
      <ContentContainer className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link
            href="/"
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-all duration-300"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className={cn(
                  'w-auto object-contain transition-all duration-300 ease-out',
                  isScrolled ? 'h-6 md:h-7' : 'h-8 md:h-9',
                )}
              />
            ) : null}
            <span
              className={cn(
                'font-serif font-bold tracking-tight text-[#FDFADB] transition-all duration-300 ease-out',
                isScrolled ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl',
              )}
            >
              {businessName}
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">{children}</div>
      </ContentContainer>
    </header>
  );
}
