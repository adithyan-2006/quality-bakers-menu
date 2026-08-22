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

  // Refs for auto-centering and the pill highlight
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<Map<string, HTMLAnchorElement>>(new Map());
  const indicatorRef = React.useRef<HTMLDivElement>(null);
  const isClickInitiated = React.useRef(false);

  // Track visibility and selection
  const visibleSections = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (categories.length === 0) return;

    // 1. Observer only tracks which sections are remotely visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.current.add(entry.target.id);
          } else {
            visibleSections.current.delete(entry.target.id);
          }
        });
      },
      // Huge root margin to ensure we catch everything in or near the viewport
      { rootMargin: '100% 0px 100% 0px' },
    );

    categories.forEach(({ slug }) => {
      const section = document.getElementById(slug);
      if (section) observer.observe(section);
    });

    // 2. Scroll listener calculates distance and guarantees EXACTLY ONE active category
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (visibleSections.current.size === 0) return;

        const activationLine = window.innerHeight * 0.35; // 35% from the top
        let closestSlug = '';
        let minDistance = Infinity;

        visibleSections.current.forEach((slug) => {
          // Measure against the exact heading rather than the entire bounding box
          const heading = document.getElementById(`category-${slug}`);
          if (heading) {
            const rect = heading.getBoundingClientRect();

            // Absolute distance from the heading to the activation line
            const distance = Math.abs(rect.top - activationLine);

            if (distance < minDistance) {
              minDistance = distance;
              closestSlug = slug;
            }
          }
        });

        if (closestSlug) {
          setActiveSlug((prev) => (prev !== closestSlug ? closestSlug : prev));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [categories]);

  // Update sliding pill position and auto-center the container
  React.useEffect(() => {
    const activeItem = itemsRef.current.get(activeSlug);
    const container = scrollContainerRef.current;
    const indicator = indicatorRef.current;

    if (activeItem && container && indicator) {
      // 1. Direct DOM mutation for indicator to avoid React renders
      indicator.style.transform = `translateX(${activeItem.offsetLeft}px)`;
      indicator.style.width = `${activeItem.offsetWidth}px`;
      indicator.style.opacity = '1';

      // 2. Auto-center active item
      const itemCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
      const containerCenter = container.offsetWidth / 2;
      const scrollTarget = itemCenter - containerCenter;

      // Use smooth only if user clicked; use instant auto-scroll if it's passive intersection
      container.scrollTo({
        left: scrollTarget,
        behavior: isClickInitiated.current ? 'smooth' : 'auto',
      });

      // Reset the click flag after applying the scroll
      if (isClickInitiated.current) {
        isClickInitiated.current = false;
      }
    }
  }, [activeSlug, categories]);

  // Ensure indicator updates on window resize
  React.useEffect(() => {
    const handleResize = () => {
      const activeItem = itemsRef.current.get(activeSlug);
      const indicator = indicatorRef.current;
      if (activeItem && indicator) {
        indicator.style.transform = `translateX(${activeItem.offsetLeft}px)`;
        indicator.style.width = `${activeItem.offsetWidth}px`;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSlug]);

  const scrollToCategory = React.useCallback((slug: string) => {
    const section = document.getElementById(slug);
    if (section) {
      const offset = 80; // Account for header height
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // Handle cross-page hash navigation (Next.js App Router bug mitigation)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return; // Do nothing if there's no hash

    const slug = hash.replace('#', '');
    let attempts = 0;
    const maxAttempts = 30; // Bound retries to ~500ms

    const tryScroll = () => {
      const section = document.getElementById(slug);
      if (section) {
        isClickInitiated.current = true;
        setActiveSlug(slug);

        // Give the browser one final frame to compute layout
        requestAnimationFrame(() => {
          scrollToCategory(slug);
        });
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    };

    // Wait for the first paint before starting to check
    requestAnimationFrame(tryScroll);
  }, [scrollToCategory]);

  return (
    <nav
      aria-label="Browse menu categories"
      className="sticky top-[68px] z-40 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm overflow-hidden"
    >
      <div
        ref={scrollContainerRef}
        className="relative flex items-center overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-3 md:py-4 snap-x snap-mandatory"
        role="list"
      >
        {/* Sliding Pill Indicator */}
        <div
          ref={indicatorRef}
          className="absolute h-10 md:h-12 bg-muted/80 rounded-full transition-all duration-300 ease-out z-0 opacity-0"
          aria-hidden="true"
        />

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
                isClickInitiated.current = true;
                setActiveSlug(slug); // Optimistic UI update
                scrollToCategory(slug);
              }}
              className={cn(
                'relative z-10 flex-shrink-0 px-5 py-2 md:py-2.5 text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap rounded-full snap-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'text-foreground font-semibold scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95',
              )}
            >
              {name}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
