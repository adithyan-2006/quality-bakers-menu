'use client';

import * as React from 'react';
import { cn } from '@qbm/ui';
import type { MenuCategoryConfig } from '../types';

interface CategoryNavProps {
  categories: Pick<MenuCategoryConfig, 'id' | 'name' | 'slug'>[];
}

/**
 * Category Navigation — Client Component
 *
 * Sticky horizontal scrolling navigator that highlights the category
 * currently in the viewport. Uses a single IntersectionObserver.
 */
export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeSlug, setActiveSlug] = React.useState<string>(categories[0]?.slug ?? '');

  // Refs for elements and state
  const navRef = React.useRef<HTMLElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<Map<string, HTMLAnchorElement>>(new Map());
  const isClickInitiated = React.useRef(false);
  const clickTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Track header scroll state to ensure zero gap when header compacts
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    let rafId: number | null = null;
    const update = () => {
      const currentY = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && currentY > 50) return true;
        if (prev && currentY < 15) return false;
        return prev;
      });
      rafId = null;
    };

    const handleHeaderScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleHeaderScroll);
    };
  }, []);

  // Deterministic scroll tracking to guarantee exactly ONE active category synchronized with viewport
  React.useEffect(() => {
    if (categories.length === 0) return;

    let rafId: number | null = null;

    const determineActiveCategory = (): string => {
      // 1. Check if user is scrolled near the bottom of the page
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;

      if (isAtBottom) {
        return categories[categories.length - 1]?.slug ?? '';
      }

      // 2. Measure sticky navigation bottom edge dynamically
      const navRect = navRef.current?.getBoundingClientRect();
      const navBottom = navRect ? navRect.bottom : window.innerWidth < 768 ? 96 : 112;
      const activationLine = navBottom + (window.innerWidth < 768 ? 20 : 28);

      // 3. Find the last category whose top boundary has crossed the activation line
      let currentSlug = categories[0]?.slug ?? '';

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        if (!cat) continue;
        const slug = cat.slug;
        const section = document.getElementById(slug);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= activationLine) {
            currentSlug = slug;
          } else {
            // Since sections are strictly ordered vertically, once rect.top > activationLine,
            // no subsequent section can be active.
            break;
          }
        }
      }

      return currentSlug;
    };

    const handleScroll = () => {
      if (isClickInitiated.current) return;
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const targetSlug = determineActiveCategory();
        if (targetSlug) {
          setActiveSlug((prev) => (prev !== targetSlug ? targetSlug : prev));
        }
      });
    };

    // Unlock click suppression on manual user gesture (wheel or touch)
    const handleUserInteraction = () => {
      if (isClickInitiated.current) {
        isClickInitiated.current = false;
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('orientationchange', handleScroll, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });

    // Initial check on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('orientationchange', handleScroll);
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, [categories]);

  // Auto-center active category in container
  React.useEffect(() => {
    const activeItem = itemsRef.current.get(activeSlug);
    const container = scrollContainerRef.current;

    if (activeItem && container) {
      const itemCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
      const containerCenter = container.offsetWidth / 2;
      const scrollTarget = itemCenter - containerCenter;

      container.scrollTo({
        left: scrollTarget,
        behavior: isClickInitiated.current ? 'smooth' : 'auto',
      });
    }
  }, [activeSlug]);

  const scrollToCategory = React.useCallback((slug: string) => {
    const section = document.getElementById(slug);
    if (section) {
      const offset = typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 120;
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const handleCategoryClick = React.useCallback(
    (slug: string) => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      isClickInitiated.current = true;
      setActiveSlug(slug);
      scrollToCategory(slug);

      clickTimerRef.current = setTimeout(() => {
        isClickInitiated.current = false;
        clickTimerRef.current = null;
      }, 800);
    },
    [scrollToCategory],
  );

  // Handle cross-page hash navigation (Next.js App Router bug mitigation)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const slug = hash.replace('#', '');
    let attempts = 0;
    const maxAttempts = 30;

    const tryScroll = () => {
      const section = document.getElementById(slug);
      if (section) {
        handleCategoryClick(slug);
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    };

    requestAnimationFrame(tryScroll);
  }, [handleCategoryClick]);

  return (
    <nav
      ref={navRef}
      aria-label="Browse menu categories"
      className={cn(
        'sticky z-40 bg-[#BC1D1A] overflow-hidden',
        'top-[64px]',
        isScrolled ? 'lg:top-[64px]' : 'lg:top-[80px]',
        'lg:transition-[top] lg:duration-300 lg:ease-out',
      )}
    >
      <div
        ref={scrollContainerRef}
        className="relative flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-2.5 md:py-3 snap-x snap-mandatory"
        role="list"
      >
        {categories.map(({ id, name, slug }) => {
          const isActive = slug === activeSlug;
          return (
            <a
              key={id}
              ref={(node) => {
                if (node) {
                  itemsRef.current.set(slug, node);
                } else {
                  itemsRef.current.delete(slug);
                }
              }}
              href={`#${slug}`}
              role="listitem"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick(slug);
              }}
              className={cn(
                'relative z-10 flex-shrink-0 px-1 py-1.5 md:py-2 text-sm md:text-base font-medium text-[#FDFADB] whitespace-nowrap snap-center tracking-wide',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDFADB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#BC1D1A]',
              )}
            >
              <span className="relative inline-block">
                {name}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-[2px] bg-[#FDFADB] rounded-full pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
