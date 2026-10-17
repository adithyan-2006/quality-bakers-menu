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

  // Cached section offsets to prevent forced layout reflow during scroll
  const sectionPositionsRef = React.useRef<{ slug: string; top: number; bottom: number }[]>([]);
  const activationLineRef = React.useRef<number>(180);

  // Update cached section offsets on mount, resize, and when content loads
  const updateCachedPositions = React.useCallback(() => {
    if (typeof window === 'undefined' || categories.length === 0) return;
    const isMobile = window.innerWidth < 768;
    const isLg = window.innerWidth >= 1024;
    const headerH = isMobile ? 64 : isLg ? 76 : 72;
    const navH = navRef.current ? navRef.current.offsetHeight : isMobile ? 52 : 60;
    const navBottom = headerH + navH;
    activationLineRef.current = navBottom + (isMobile ? 36 : 48);

    const list: { slug: string; top: number; bottom: number }[] = [];
    for (const cat of categories) {
      const el = document.getElementById(cat.slug);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const bottom = top + el.offsetHeight;
        list.push({ slug: cat.slug, top, bottom });
      }
    }
    sectionPositionsRef.current = list;
  }, [categories]);

  // Deterministic scroll tracking with hysteresis — zero layout thrashing
  React.useEffect(() => {
    if (categories.length === 0) return;

    let rafId: number | null = null;

    const determineActiveCategory = (prevSlug: string): string => {
      const positions = sectionPositionsRef.current;
      if (!positions.length) return categories[0]?.slug ?? '';

      const scrollY = window.scrollY;

      // 1. Check if user is scrolled near the bottom of the page
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 60) {
        return categories[categories.length - 1]?.slug ?? '';
      }

      const targetY = scrollY + activationLineRef.current;
      const currentIndex = positions.findIndex((p) => p.slug === prevSlug);

      // Deadband hysteresis buffer (16px) to prevent rapid toggling near section boundaries
      const hysteresis = 16;

      if (currentIndex !== -1) {
        // Advancing to subsequent section?
        if (currentIndex < positions.length - 1) {
          const next = positions[currentIndex + 1];
          if (next && targetY >= next.top + hysteresis) {
            let targetIdx = currentIndex + 1;
            while (targetIdx < positions.length - 1) {
              const upcoming = positions[targetIdx + 1];
              if (upcoming && targetY >= upcoming.top + hysteresis) {
                targetIdx++;
              } else {
                break;
              }
            }
            return positions[targetIdx]?.slug ?? prevSlug;
          }
        }

        // Stepping back to previous section?
        const current = positions[currentIndex];
        if (current && targetY < current.top - hysteresis) {
          let targetIdx = currentIndex - 1;
          while (targetIdx > 0) {
            const prev = positions[targetIdx];
            if (prev && targetY < prev.top - hysteresis) {
              targetIdx--;
            } else {
              break;
            }
          }
          return positions[Math.max(0, targetIdx)]?.slug ?? prevSlug;
        }

        return prevSlug;
      }

      // Initial / fallback scan
      let currentSlug = positions[0]?.slug ?? '';
      for (const p of positions) {
        if (targetY >= p.top) {
          currentSlug = p.slug;
        } else {
          break;
        }
      }
      return currentSlug;
    };

    const handleScroll = () => {
      if (isClickInitiated.current) return;
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        setActiveSlug((prev) => determineActiveCategory(prev));
      });
    };

    const handleUserInteraction = () => {
      if (isClickInitiated.current) {
        isClickInitiated.current = false;
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
      }
    };

    const handleResize = () => {
      updateCachedPositions();
      handleScroll();
    };

    // Cache initial positions and schedule follow-ups for dynamic content/images
    updateCachedPositions();
    const t1 = setTimeout(updateCachedPositions, 300);
    const t2 = setTimeout(updateCachedPositions, 1000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [categories, updateCachedPositions]);

  // Smooth auto-scroll only when active item is near/outside visible viewport
  React.useEffect(() => {
    const activeItem = itemsRef.current.get(activeSlug);
    const container = scrollContainerRef.current;

    if (activeItem && container) {
      const itemLeft = activeItem.offsetLeft - container.scrollLeft;
      const itemRight = itemLeft + activeItem.offsetWidth;
      const containerWidth = container.clientWidth;

      // Keep active item within comfortable center zone without shaking
      const edgeBuffer = 48;
      const isComfortablyVisible =
        itemLeft >= edgeBuffer && itemRight <= containerWidth - edgeBuffer;

      // Only scroll horizontally if item is near/outside edges, or user clicked
      if (!isComfortablyVisible || isClickInitiated.current) {
        const itemCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
        const containerCenter = containerWidth / 2;
        const scrollTarget = itemCenter - containerCenter;

        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth',
        });
      }
    }
  }, [activeSlug]);

  // Dynamic ResizeObserver to refresh section offsets whenever layout or images change
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      updateCachedPositions();
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [updateCachedPositions]);

  const scrollToCategory = React.useCallback((slug: string) => {
    const section = document.getElementById(slug);
    if (section) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const isLg = typeof window !== 'undefined' && window.innerWidth >= 1024;
      const headerH = isMobile ? 64 : isLg ? 76 : 72;
      const navH = navRef.current ? navRef.current.offsetHeight : isMobile ? 52 : 60;
      const offset = headerH + navH + 16;
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

      if (typeof window !== 'undefined' && window.location.hash !== `#${slug}`) {
        window.history.pushState(null, '', `#${slug}`);
      }

      clickTimerRef.current = setTimeout(() => {
        isClickInitiated.current = false;
        clickTimerRef.current = null;
      }, 800);
    },
    [scrollToCategory],
  );

  // Handle cross-page and browser back/forward hash navigation
  React.useEffect(() => {
    const validSlugs = new Set(categories.map((c) => c.slug));

    const forceScrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 80);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 180);
    };

    const handleHashNav = () => {
      const hash = window.location.hash;
      if (!hash) {
        forceScrollTop();
        return;
      }

      const slug = hash.replace('#', '');
      if (!validSlugs.has(slug)) {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        forceScrollTop();
        return;
      }

      let attempts = 0;
      const maxAttempts = 30;

      const tryScroll = () => {
        const section = document.getElementById(slug);
        if (section) {
          handleCategoryClick(slug);
          setTimeout(() => {
            scrollToCategory(slug);
          }, 200);
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(tryScroll);
        } else {
          forceScrollTop();
        }
      };

      requestAnimationFrame(tryScroll);
    };

    handleHashNav();
    window.addEventListener('hashchange', handleHashNav);
    window.addEventListener('popstate', handleHashNav);

    return () => {
      window.removeEventListener('hashchange', handleHashNav);
      window.removeEventListener('popstate', handleHashNav);
    };
  }, [categories, handleCategoryClick, scrollToCategory]);

  return (
    <nav
      ref={navRef}
      aria-label="Browse menu categories"
      className={cn(
        'sticky z-40 bg-[#BC1D1A] overflow-hidden',
        'top-[64px] md:top-[72px] lg:top-[76px]',
        'py-1.5 sm:py-2 md:py-2.5',
        'transform-gpu will-change-transform',
      )}
      style={{
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <div
        ref={scrollContainerRef}
        className="relative flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-0.5 md:py-1 snap-x snap-proximity"
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
              aria-current={isActive ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick(slug);
              }}
              className={cn(
                'relative z-10 flex-shrink-0 min-h-[44px] flex items-center px-2.5 sm:px-3 py-2 font-sans font-bold uppercase tracking-[0.15em] text-xs sm:text-sm whitespace-nowrap snap-center transition-colors duration-200 rounded-lg',
                isActive ? 'text-[#FDFADB]' : 'text-[#FDFADB]/70 hover:text-[#FDFADB]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDFADB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#BC1D1A]',
              )}
            >
              <span className="relative inline-block">{name}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
