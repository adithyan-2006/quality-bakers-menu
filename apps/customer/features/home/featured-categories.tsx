'use client';

import * as React from 'react';
import Link from 'next/link';
import { SectionTitle } from '../../components/layout/section-title';
import type { Prisma } from '@qbm/database';

type CategoryWithMedia = Prisma.CategoryGetPayload<{
  include: { coverImage: true };
}>;

interface FeaturedCategoriesProps {
  categories: CategoryWithMedia[];
}

interface CardLayoutCache {
  centerInViewportAtZero: number;
  width: number;
  imageWrapper: HTMLElement | null;
  imageBg: HTMLElement | null;
  glare: HTMLElement | null;
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const cardsRef = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const cardsCacheRef = React.useRef<CardLayoutCache[]>([]);

  // Lerp state
  const scrollTarget = React.useRef(0);
  const currentScroll = React.useRef(0);
  const rafId = React.useRef<number | null>(null);

  // Scroll geometry state (updated only on scroll / resize — decoupled from RAF write)
  const scrollState = React.useRef({
    containerTop: 0,
    containerBottom: 0,
    stickyBottom: 0,
    scrolled: 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const stopsRef = React.useRef<number[]>([]);
  const maxDistanceRef = React.useRef(0);
  const stickyTopRef = React.useRef(0);

  // ------------------------------------------------------------------
  // getHoldDistances — Calibrated hold durations for first & last card.
  // Gives first card a hold buffer when scrolling up from the bottom.
  // ------------------------------------------------------------------
  const getHoldDistances = React.useCallback(() => {
    if (typeof window === 'undefined') return { startHold: 240, endHold: 140 };
    const width = window.innerWidth;
    const isDesktop = width >= 1024;
    const isTablet = width >= 640 && width < 1024;
    const startHold = isDesktop ? 260 : isTablet ? 200 : 180;
    const endHold = isDesktop ? 160 : isTablet ? 120 : 100;
    return { startHold, endHold };
  }, []);

  // ------------------------------------------------------------------
  // syncContainerHeight — MUST be called after buildStops().
  // Sets section minHeight based on startHold + maxDistance + endHold + stickyHeight.
  // When maxDistance <= 0, resets to normal block flow and centers cards.
  // ------------------------------------------------------------------
  const syncContainerHeight = React.useCallback(() => {
    if (!containerRef.current || !stickyRef.current) return;

    const stops = stopsRef.current;
    const maxDistance = stops.length > 0 ? (stops[stops.length - 1] ?? 0) : 0;
    maxDistanceRef.current = maxDistance;

    // Read the actual CSS `top` value. Fall back to header height (64 mobile, 72 md, 76 lg) — never 0.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isLg = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const fallbackTop = isMobile ? 64 : isLg ? 76 : 72;
    const stickyTopRaw = parseInt(getComputedStyle(stickyRef.current).top, 10);
    const stickyTop = isNaN(stickyTopRaw) || stickyTopRaw === 0 ? fallbackTop : stickyTopRaw;
    stickyTopRef.current = stickyTop;

    const stickyHeight = stickyRef.current.offsetHeight;
    const { startHold, endHold } = getHoldDistances();

    if (maxDistance <= 0) {
      containerRef.current.style.minHeight = 'auto';
      if (trackRef.current) {
        trackRef.current.style.justifyContent = 'center';
        trackRef.current.style.width = '100%';
      }
    } else {
      const totalScroll = startHold + maxDistance + endHold;
      containerRef.current.style.minHeight = `${totalScroll + stickyHeight}px`;
      if (trackRef.current) {
        trackRef.current.style.justifyContent = '';
        trackRef.current.style.width = 'max-content';
      }
    }
  }, [getHoldDistances]);

  // ------------------------------------------------------------------
  // buildStops: Pre-computes card stop positions and caches layout offsets.
  //
  // Measures card coordinates ONCE on resize/mount so the 60fps RAF loop
  // has ZERO getBoundingClientRect() calls and ZERO layout thrashing.
  // ------------------------------------------------------------------
  const buildStops = React.useCallback(() => {
    if (!trackRef.current) return;

    const savedTransform = trackRef.current.style.transform;
    trackRef.current.style.transform = 'none';

    cardsRef.current = cardsRef.current.slice(0, categories.length);

    const viewportCenter = window.innerWidth / 2;
    const stops: number[] = [];
    const caches: CardLayoutCache[] = [];

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const requiredScroll = cardCenter - viewportCenter;
      if (requiredScroll >= 0) stops.push(requiredScroll);

      caches.push({
        centerInViewportAtZero: cardCenter,
        width: rect.width,
        imageWrapper: card.querySelector('.focus-scale') as HTMLElement,
        imageBg: card.querySelector('.focus-image') as HTMLElement,
        glare: card.querySelector('.focus-glare') as HTMLElement,
      });
    });

    stopsRef.current = stops;
    cardsCacheRef.current = caches;
    trackRef.current.style.transform = savedTransform;
  }, [categories.length]);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onScroll = () => {
      if (!containerRef.current || !stickyRef.current || !headerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const sRect = stickyRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrolled = -cRect.top;

      scrollState.current = {
        containerTop: cRect.top,
        containerBottom: cRect.bottom,
        stickyBottom: sRect.bottom,
        scrolled,
        windowHeight,
      };
    };

    const onResize = () => {
      buildStops();
      syncContainerHeight();
      onScroll();
    };

    // ----------------------------------------------------------------
    // renderLoop: 60/120fps hardware-accelerated compositor render.
    // ZERO DOM measurements (all layout geometry is pre-cached).
    // Smooth damped lerp eliminates stepping and boundary jitter.
    // ----------------------------------------------------------------
    const renderLoop = () => {
      if (!containerRef.current || !stickyRef.current || !trackRef.current || !headerRef.current) {
        rafId.current = requestAnimationFrame(renderLoop);
        return;
      }

      const { containerTop, scrolled, windowHeight } = scrollState.current;
      const stickyTopPx = stickyTopRef.current;
      const maxDistance = maxDistanceRef.current;

      // 1. Entry Animation (Vertical Parallax & Opacity)
      const entryWindow =
        window.innerWidth < 768 ? Math.min(windowHeight * 0.5, 360) : windowHeight / 2;
      const entryProgress = Math.min(Math.max((scrolled + entryWindow) / entryWindow, 0), 1);
      let entryY = 0;
      if (scrolled < 0) {
        headerRef.current.style.opacity = `${entryProgress}`;
        headerRef.current.style.transform = `translate3d(0, ${(1 - entryProgress) * 40}px, 0)`;
        trackRef.current.style.opacity = `${entryProgress}`;
        entryY = (1 - entryProgress) * 60;
      } else {
        headerRef.current.style.opacity = '1';
        headerRef.current.style.transform = 'translate3d(0, 0, 0)';
        trackRef.current.style.opacity = '1';
        entryY = 0;
      }

      // 2. Horizontal Controller with First-Card Hold and End-Card Hold
      if (maxDistance <= 0) {
        trackRef.current.style.transform = `translate3d(0, ${entryY.toFixed(2)}px, 0)`;
        rafId.current = requestAnimationFrame(renderLoop);
        return;
      }

      const { startHold } = getHoldDistances();
      const pinnedDistance = stickyTopPx - containerTop;

      let exactTarget = 0;
      if (pinnedDistance <= startHold) {
        // First-card hold zone: keeps first card firmly centered
        // Especially crucial when scrolling up from bottom to top!
        exactTarget = 0;
      } else if (pinnedDistance >= startHold + maxDistance) {
        // Last-card hold zone: keeps last card centered before unpinning
        exactTarget = maxDistance;
      } else {
        // Active horizontal carousel zone
        const scrollDistance = pinnedDistance - startHold;
        const progress = scrollDistance / maxDistance;
        exactTarget = progress * maxDistance;
      }

      exactTarget = Math.min(Math.max(exactTarget, 0), maxDistance);
      scrollTarget.current = exactTarget;

      // Responsive adaptive damping: blends discrete mouse wheel notches smoothly
      // Snap when within 0.25px to prevent floating point sub-pixel jitter
      const delta = exactTarget - currentScroll.current;
      if (Math.abs(delta) < 0.25) {
        currentScroll.current = exactTarget;
      } else {
        currentScroll.current += delta * 0.32;
      }

      currentScroll.current = Math.min(Math.max(currentScroll.current, 0), maxDistance);

      // Single hardware-accelerated transform write for the track
      trackRef.current.style.transform = `translate3d(-${currentScroll.current.toFixed(2)}px, ${entryY.toFixed(2)}px, 0)`;

      // 3. Card visual updates across ALL devices (Desktop, Tablet, Mobile)
      const isDesktop = window.innerWidth >= 1024;
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
      const viewportCenterX = window.innerWidth / 2;
      const cards = cardsCacheRef.current;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card) continue;
        const cardCenterX = card.centerInViewportAtZero - currentScroll.current;

        // Normalized offset from viewport center
        const offset = cardCenterX - viewportCenterX;
        const cardW = card.width || (isDesktop ? 340 : isTablet ? 290 : 230);
        const spacing = cardW + (isDesktop ? 32 : window.innerWidth < 640 ? 16 : 24);
        const norm = spacing > 0 ? offset / spacing : 0;
        const absNorm = Math.abs(norm);
        const intensity = Math.max(0, 1 - Math.min(absNorm, 1.25) / 1.25);

        // 3D Cylindrical Rotation: cards rotate around Y-axis to feel like rotating on a curved drum
        const maxAngle = isDesktop ? 9.5 : isTablet ? 8.5 : 7.5;
        const rotY = (
          -Math.sign(offset) * Math.min(Math.pow(absNorm, 0.88) * maxAngle, maxAngle * 1.3)
        ).toFixed(2);

        // Depth in Z: cards recess back along the cylindrical curve
        const maxZ = isDesktop ? 48 : isTablet ? 38 : 28;
        const transZ = (
          intensity * 8 -
          Math.min(Math.pow(absNorm, 1.25) * (maxZ * 0.72), maxZ)
        ).toFixed(1);

        // Elevation scale: center card is prominent, edge cards gracefully recede
        const scale = (0.945 + 0.085 * intensity).toFixed(3);

        // Optical brilliance & contrast
        const opacity = (0.76 + 0.24 * intensity).toFixed(2);
        const brightness = (0.86 + 0.18 * intensity).toFixed(2);
        const contrast = (0.97 + 0.06 * intensity).toFixed(2);

        if (card.imageWrapper) {
          const persp = isDesktop ? 1200 : 950;
          card.imageWrapper.style.transform = `perspective(${persp}px) rotateY(${rotY}deg) translateZ(${transZ}px) scale(${scale})`;
          card.imageWrapper.style.opacity = opacity;
        }

        if (card.imageBg) {
          card.imageBg.style.filter = `brightness(${brightness}) contrast(${contrast})`;
        }

        if (card.glare) {
          card.glare.style.opacity = (intensity * 0.35).toFixed(2);
        }
      }

      rafId.current = requestAnimationFrame(renderLoop);
    };

    // Geometry setup after first paint
    const initId = requestAnimationFrame(() => {
      buildStops();
      syncContainerHeight();
      onScroll();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Track dynamic dimension changes without full window resize
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && trackRef.current) {
      resizeObserver = new ResizeObserver(() => {
        buildStops();
        syncContainerHeight();
        onScroll();
      });
      resizeObserver.observe(trackRef.current);
    }

    // ----------------------------------------------------------------
    // Touch Swipe Gesture Support for Mobile & Tablets:
    // Allows horizontal swipe gestures on the collection to advance
    // the gallery naturally alongside vertical scrolling.
    // ----------------------------------------------------------------
    let touchStartX = 0;
    let touchStartY = 0;
    let touchScrollTop = 0;
    let isHorizontalGesture = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || e.touches.length !== 1) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchScrollTop = window.scrollY;
      isHorizontalGesture = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch || e.touches.length !== 1) return;
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (!isHorizontalGesture && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        if (Math.abs(dx) > Math.abs(dy) * 1.2) {
          isHorizontalGesture = true;
        }
      }

      if (isHorizontalGesture) {
        const cRect = containerRef.current?.getBoundingClientRect();
        if (cRect) {
          const stickyTopPx = stickyTopRef.current;
          const stickyHeight = stickyRef.current?.offsetHeight ?? 0;
          const isInStickyZone =
            cRect.top <= stickyTopPx + 10 && cRect.bottom >= stickyTopPx + stickyHeight - 10;

          if (isInStickyZone) {
            e.preventDefault();
            // Swiping left (dx < 0) advances the gallery (scrolls down)
            window.scrollTo({
              top: touchScrollTop - dx * 1.3,
              behavior: 'auto',
            });
          }
        }
      }
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      containerEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    onScroll();
    rafId.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(initId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (containerEl) {
        containerEl.removeEventListener('touchstart', handleTouchStart);
        containerEl.removeEventListener('touchmove', handleTouchMove);
      }
      if (resizeObserver) resizeObserver.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [syncContainerHeight, buildStops, getHoldDistances]);

  if (!categories || categories.length === 0) return null;

  return (
    <section ref={containerRef} className="relative w-full bg-[#BC1D1A]">
      {/* Sticky panel — top:64px mobile, 72px md, 76px lg keeps content below the header */}
      <div
        ref={stickyRef}
        className="sticky top-[64px] md:top-[72px] lg:top-[76px] w-full h-[calc(100vh-64px)] md:h-[calc(100vh-72px)] lg:h-[calc(100vh-76px)] overflow-hidden flex flex-col justify-center py-4 md:pt-8 md:pb-20"
      >
        {/* Section Header */}
        <div
          ref={headerRef}
          className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-6 md:mb-14 will-change-transform opacity-0"
        >
          <SectionTitle className="text-left text-[#FDFADB]">Explore Collections</SectionTitle>
          <p className="mt-4 text-lg md:text-xl text-[#FDFADB]/80 font-light max-w-xl">
            A handcrafted selection of our signature drinks and desserts.
          </p>
        </div>

        {/* Single Horizontal Gallery */}
        <div className="w-full relative touch-pan-y" style={{ perspective: '1400px' }}>
          <div
            ref={trackRef}
            className="flex items-center gap-4 sm:gap-6 md:gap-8 px-6 lg:px-8 w-max will-change-transform opacity-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {categories.map((category, idx) => {
              const imageUrl = category.coverImage
                ? category.coverImage.secureUrl || category.coverImage.originalUrl
                : null;

              return (
                <Link
                  key={category.id}
                  href={`/categories#${category.slug}`}
                  scroll={false}
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  ref={(el) => {
                    cardsRef.current[idx] = el;
                  }}
                  className="explore-card group relative block w-[56vw] min-w-[200px] max-w-[240px] sm:w-[260px] sm:max-w-none md:w-[300px] lg:w-[360px] aspect-[4/5] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDFADB] rounded-2xl sm:rounded-3xl"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Scalable Container for Center Focus with hardware-accelerated elevation shadow & delicate cream rim */}
                  <div className="focus-scale w-full h-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#FDFADB]/20 will-change-transform shadow-[0_16px_40px_-8px_rgba(25,2,2,0.65),0_8px_18px_-4px_rgba(35,3,3,0.45),0_0_0_1px_rgba(253,250,219,0.18)] hover:shadow-[0_24px_55px_-6px_rgba(25,2,2,0.75),0_12px_24px_-4px_rgba(35,3,3,0.55),0_0_0_1.5px_rgba(253,250,219,0.35)] transition-shadow duration-500">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-20 pointer-events-none" />

                    {/* Specular Glare/Sheen on rotation */}
                    <div className="focus-glare absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/12 to-transparent opacity-0 transition-opacity duration-300" />

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.coverImage?.altText || category.name}
                        className="focus-image absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105 will-change-transform"
                        loading={idx < 3 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="focus-image absolute inset-0 bg-[#8F211B]/40 z-10 transition-transform duration-700 group-hover:scale-105 will-change-transform flex items-center justify-center p-4">
                        <span className="font-serif text-lg text-[#FDFADB]/60 text-center">
                          {category.name}
                        </span>
                      </div>
                    )}

                    {/* Content (Bottom Anchored) */}
                    <div className="relative z-30 h-full p-6 md:p-8 flex flex-col justify-end text-left pointer-events-none">
                      <h3 className="font-serif text-2xl md:text-3xl font-medium text-[#FDFADB] drop-shadow-md tracking-wide mb-1">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reduced Motion Fallback */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (prefers-reduced-motion: reduce) {
          section {
            min-height: auto !important;
            padding-top: 4rem;
            padding-bottom: 4rem;
          }
          .sticky {
            position: relative !important;
            height: auto !important;
            top: auto !important;
            padding: 0 !important;
          }
          .will-change-transform {
            opacity: 1 !important;
            transform: none !important;
          }
          .w-max {
            flex-wrap: wrap !important;
            width: 100% !important;
            justify-content: center;
          }
          .explore-card {
            width: 100% !important;
            max-width: 360px;
          }
          .focus-scale {
            transform: none !important;
            box-shadow: 0 16px 40px -8px rgba(25,2,2,0.65) !important;
            opacity: 1 !important;
          }
        }
      `,
        }}
      />
    </section>
  );
}
