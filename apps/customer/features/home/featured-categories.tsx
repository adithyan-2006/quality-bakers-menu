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

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const cardsRef = React.useRef<(HTMLAnchorElement | null)[]>([]);

  // Lerp state
  const scrollTarget = React.useRef(0);
  const currentScroll = React.useRef(0);
  const rafId = React.useRef<number | null>(null);

  // The architectural requirement:
  // scroll event -> store state -> RAF -> compute -> ONE write
  const scrollState = React.useRef({
    containerTop: 0,
    containerBottom: 0,
    stickyBottom: 0,
    scrolled: 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Card stops (viewport-centred translation amounts).
  // stopsRef[0] is always 0 (natural first-card position at left edge).
  // stopsRef[last] is the last card centering translation = maxDistance.
  const stopsRef = React.useRef<number[]>([]);

  // Geometry refs — derived exclusively from stopsRef and real rendered
  // sticky dimensions. No independent trackScrollWidth formula.
  //
  //   maxDistanceRef = stopsRef[last]  (total horizontal travel, px)
  //   stickyTopRef   = CSS `top` value of the sticky element (px)
  //
  // Progress formula:
  //   rawProgress = (scrolled + stickyTopPx) / maxDistance
  //
  // Proof that this aligns lock / release with progress 0 / 1:
  //
  //   For position:sticky; top:T the browser:
  //     locks    when containerTop = T   → scrolled = -T
  //     releases when containerTop = T + stickyHeight - sectionHeight
  //
  //   sectionHeight = stickyHeight + maxDistance
  //   Release scrolled = maxDistance - T
  //
  //   Lock:    rawProgress = (-T + T) / maxDistance = 0              ✓
  //   Release: rawProgress = (maxDistance - T + T) / maxDistance = 1 ✓
  //
  // Without +stickyTopPx:
  //   release rawProgress = (maxDistance - T) / maxDistance ≠ 1
  //   → T pixels of dead zone / premature release (T = 68px in this layout).
  // startStopRef = stopsRef[0]: horizontal position at rawProgress = 0.
  // endStopRef   = stopsRef[last]: horizontal position at rawProgress = 1.
  // horizontalRange = endStop - startStop: physical sticky travel equals this.
  //
  // Using [startStop, endStop] instead of [0, endStop] is what eliminates the
  // upward boundary step: at rawProgress = 0, rawTarget = startStop = stopsRef[0].
  // The closest magnetic stop is stopsRef[0] with delta = 0, so pacedTarget =
  // startStop exactly. The boundary snap fires at the same value the pacing
  // was already targeting — zero jump in either direction.
  const maxDistanceRef = React.useRef(0);
  const stickyTopRef = React.useRef(0);

  // ------------------------------------------------------------------
  // syncContainerHeight — MUST be called after buildStops().
  // Derives maxDistance from stopsRef[last] and reads the real CSS top
  // so the progress formula and section height are exactly coupled with
  // the browser sticky geometry.
  // ------------------------------------------------------------------
  const syncContainerHeight = React.useCallback(() => {
    if (!containerRef.current || !stickyRef.current) return;

    const stops = stopsRef.current;
    const maxDistance = stops.length > 0 ? (stops[stops.length - 1] ?? 0) : 0;
    maxDistanceRef.current = maxDistance;

    // Read the actual CSS `top` value. Fall back to header height (52 mobile, 68 desktop) — never 0.
    const fallbackTop = typeof window !== 'undefined' && window.innerWidth < 768 ? 52 : 68;
    const stickyTopRaw = parseInt(getComputedStyle(stickyRef.current).top, 10);
    const stickyTop = isNaN(stickyTopRaw) || stickyTopRaw === 0 ? fallbackTop : stickyTopRaw;
    stickyTopRef.current = stickyTop;

    // Physical sticky travel proof:
    //   sectionHeight = stickyHeight + maxDistance
    //   sticky travel = sectionHeight - stickyHeight = maxDistance ✓
    const stickyHeight = stickyRef.current.offsetHeight;
    containerRef.current.style.minHeight = `${maxDistance + stickyHeight}px`;
  }, []);

  // ------------------------------------------------------------------
  // buildStops: viewport-centred card stop positions.
  //
  // Computes the horizontal translation required to center each card.
  // Only cards whose center is to the RIGHT of the viewport center when
  // the track is at transform:none (requiredScroll >= 0) produce a stop.
  //
  // Cards to the LEFT of center need negative translation (already visible
  // at X=0) — they have no stop and the pacing does not touch them.
  //
  // Saves and restores the live transform so renderLoop is not
  // interrupted by a visible frame jump during resize.
  //
  // Must run before syncContainerHeight().
  // ------------------------------------------------------------------
  const buildStops = React.useCallback(() => {
    if (!trackRef.current) return;

    const savedTransform = trackRef.current.style.transform;
    trackRef.current.style.transform = 'none';

    const viewportCenter = window.innerWidth / 2;
    // Do NOT insert a synthetic 0 here. Adding 0 as a magnetic stop creates a
    // discontinuity: the closestStop selection flips from 0 → stopsRef[0] at the
    // midpoint, causing a sudden 100-140px jump in pacedTarget — the stepping at
    // both boundaries reported by the user.
    const stops: number[] = [];
    cardsRef.current.forEach((card) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const requiredScroll = cardCenter - viewportCenter;
      if (requiredScroll >= 0) stops.push(requiredScroll);
    });

    stopsRef.current = stops;
    trackRef.current.style.transform = savedTransform;
  }, []);

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

    const renderLoop = () => {
      if (!containerRef.current || !stickyRef.current || !trackRef.current || !headerRef.current) {
        rafId.current = requestAnimationFrame(renderLoop);
        return;
      }

      const { containerTop, containerBottom, stickyBottom, scrolled, windowHeight } =
        scrollState.current;
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
        headerRef.current.style.opacity = `1`;
        headerRef.current.style.transform = `translate3d(0, 0, 0)`;
        trackRef.current.style.opacity = `1`;
        entryY = 0;
      }

      // 2. Horizontal Controller
      // Strictly separate physical bounds from visual easing.
      const hasReachedLock = containerTop <= stickyTopPx;
      const hasReleased = containerBottom <= stickyBottom + 1;

      if (!hasReachedLock) {
        // BEFORE LOCK: Strictly exact start position. No pre-scroll.
        scrollTarget.current = 0;
        currentScroll.current = 0;
      } else if (hasReleased) {
        // AFTER RELEASE: Strictly exact end position. No post-scroll.
        scrollTarget.current = maxDistance;
        currentScroll.current = maxDistance;
      } else {
        // ACTIVE STICKY INTERVAL
        // Continuous, free horizontal movement. No magnetic snapping.
        const rawProgress = maxDistance > 0 ? (stickyTopPx - containerTop) / maxDistance : 0;
        // Ensure progress is tightly clamped between 0 and 1 before mapping
        const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
        const exactTarget = clampedProgress * maxDistance;

        scrollTarget.current = exactTarget;

        // Very light responsive inertia (0.35) to visually blend discrete mouse-wheel steps.
        // It provides a continuous, fluid feel without the noticeable lag of a slow 0.05 lerp.
        // This ensures the horizontal position feels tightly synchronized with the page.
        currentScroll.current += (exactTarget - currentScroll.current) * 0.35;

        // Clamp the rendered position so it can never mathematically overshoot.
        currentScroll.current = Math.min(Math.max(currentScroll.current, 0), maxDistance);
      }

      // ONE authoritative transform write per frame.
      trackRef.current.style.transform = `translate3d(-${currentScroll.current}px, ${entryY}px, 0)`;

      // Center focus:
      const viewportCenterX = window.innerWidth / 2;
      const isDesktop = window.innerWidth >= 1024; // desktop/PC breakpoint

      cardsRef.current.forEach((card) => {
        if (!card) return;

        const imageWrapper = card.querySelector('.focus-scale') as HTMLElement;
        const imageBg = card.querySelector('.focus-image') as HTMLElement;

        if (isDesktop) {
          // PC/Desktop: All cards share identical top position, identical height, identical bottom position, and consistent layered physical elevation shadow.
          const rect = card.getBoundingClientRect();
          const cardCenterX = rect.left + rect.width / 2;
          const distance = Math.abs(viewportCenterX - cardCenterX);
          const visualRadius = window.innerWidth * 0.4;
          const normalizedDistance = Math.min(distance / visualRadius, 1);
          const intensity = 1 - normalizedDistance;

          const baseBrightness = 1;
          const brightnessBoost = 0.08 * intensity;
          const brightness = baseBrightness + brightnessBoost;

          // Soft layered dark physical shadow consistent across all cards on PC
          const desktopShadow =
            '0 4px 6px -1px rgba(0, 0, 0, 0.22), 0 12px 24px -4px rgba(0, 0, 0, 0.28), 0 20px 36px -8px rgba(0, 0, 0, 0.20)';

          if (imageWrapper) {
            imageWrapper.style.transform = 'none';
            imageWrapper.style.opacity = '1';
            imageWrapper.style.boxShadow = desktopShadow;
            imageWrapper.style.border = 'none';
            imageWrapper.style.outline = 'none';
          }
          if (imageBg) {
            imageBg.style.filter = `brightness(${brightness.toFixed(2)})`;
          }
        } else {
          // Mobile & Tablet: retain the current convex/curved convoy effect and refined shadow
          const rect = card.getBoundingClientRect();
          const cardCenterX = rect.left + rect.width / 2;
          const offset = cardCenterX - viewportCenterX;

          // Approximate inter-card center distance (width + gap)
          const cardWidth = rect.width;
          const gap = window.innerWidth < 640 ? 16 : 24;
          const spacing = cardWidth + gap;
          const norm = spacing > 0 ? offset / spacing : 0;
          const absNorm = Math.abs(norm);

          // Intensity: 1 at center, drops to 0 at adjacent neighbor (norm = 1)
          const intensity = Math.max(0, 1 - Math.min(absNorm, 1));

          // Scale: Center card is largest (1.03), neighbor cards slightly smaller (0.95), further cards down to 0.88
          const scale = 1.03 - Math.min(absNorm, 2) * 0.075;

          // Convex Convoy Rotation (rotateY):
          // Center card faces directly forward (0deg).
          // Card to the left (offset < 0) angles subtly toward center (+rotateY).
          // Card to the right (offset > 0) angles subtly toward center (-rotateY).
          // Max angle ~5.5deg ensures subtle, tactile card curve without distorting food photography.
          const rotY = -Math.sign(offset) * Math.min(absNorm, 1.2) * 5.5;

          // Depth (translateZ): Center card closest to viewer, neighboring cards subtly recessed
          const transZ = -Math.min(absNorm, 2) * 16;

          // Controlled opacity: Center card is fully prominent; neighbors remain readable
          const opacity = 0.72 + 0.28 * intensity;

          // Brightness: center card is vibrant, neighbor cards slightly softer
          const brightness = 0.85 + 0.1 * intensity;

          // Accurate Shadow on red background:
          // Multi-layered: tight ambient occlusion + soft elevation drop
          // Center card: strongest elevation
          // Neighbor cards: softer, gentle elevation
          const elevY = Math.round(8 + 12 * intensity);
          const elevBlur = Math.round(18 + 22 * intensity);
          const elevAlpha = (0.2 + 0.16 * intensity).toFixed(2);
          const ambY = Math.round(2 + 2 * intensity);
          const ambBlur = Math.round(6 + 6 * intensity);
          const ambAlpha = (0.14 + 0.08 * intensity).toFixed(2);

          if (imageWrapper) {
            imageWrapper.style.border = '';
            imageWrapper.style.outline = '';
            imageWrapper.style.transform = `perspective(1000px) rotateY(${rotY.toFixed(2)}deg) translateZ(${transZ.toFixed(1)}px) scale(${scale.toFixed(3)})`;
            imageWrapper.style.opacity = `${opacity.toFixed(2)}`;
            imageWrapper.style.boxShadow = `0 ${elevY}px ${elevBlur}px -8px rgba(0,0,0,${elevAlpha}), 0 ${ambY}px ${ambBlur}px -2px rgba(0,0,0,${ambAlpha})`;
          }
          if (imageBg) {
            imageBg.style.filter = `brightness(${brightness.toFixed(2)})`;
          }
        }
      });

      rafId.current = requestAnimationFrame(renderLoop);
    };

    // Geometry setup after first paint so CSS (including 100vh and sticky top)
    // has settled. onScroll is defined above so it can be called here to
    // re-snap currentScroll with the real geometry before the first user scroll.
    const initId = requestAnimationFrame(() => {
      buildStops();
      syncContainerHeight();
      onScroll();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    onScroll(); // initial call with empty geometry (snaps to 0, safe fallback)
    rafId.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(initId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [syncContainerHeight, buildStops]);

  if (!categories || categories.length === 0) return null;

  return (
    <section ref={containerRef} className="relative w-full bg-[#BC1D1A]">
      {/* Sticky panel — top:52px mobile, 68px desktop keeps content below the compact header */}
      <div
        ref={stickyRef}
        className="sticky top-[52px] md:top-[68px] w-full h-[calc(100vh-52px)] md:h-[calc(100vh-68px)] overflow-hidden flex flex-col justify-center py-4 md:pt-8 md:pb-20"
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
        <div className="w-full relative">
          <div
            ref={trackRef}
            className="flex items-center gap-4 sm:gap-6 md:gap-8 px-6 lg:px-8 w-max will-change-transform opacity-0"
          >
            {categories.map((category, idx) => {
              const imageUrl = category.coverImage
                ? category.coverImage.secureUrl || category.coverImage.originalUrl
                : null;

              return (
                <Link
                  key={category.id}
                  href={`/categories#${category.slug}`}
                  ref={(el) => {
                    cardsRef.current[idx] = el;
                  }}
                  className="explore-card group relative block w-[56vw] min-w-[200px] max-w-[240px] sm:w-[260px] sm:max-w-none md:w-[300px] lg:w-[360px] aspect-[4/5] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDFADB] rounded-2xl"
                >
                  {/* Scalable Container for Center Focus */}
                  <div className="focus-scale w-full h-full relative overflow-hidden rounded-2xl border border-white/10 lg:border-0 will-change-transform lg:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.22),0_12px_24px_-4px_rgba(0,0,0,0.28),0_20px_36px_-8px_rgba(0,0,0,0.20)]">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-20" />

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.coverImage?.altText || category.name}
                        className="focus-image absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105 will-change-transform"
                      />
                    ) : (
                      <div className="focus-image absolute inset-0 bg-[#8F211B]/40 z-10 transition-transform duration-700 group-hover:scale-105 will-change-transform" />
                    )}

                    {/* Content (Bottom Anchored) */}
                    <div className="relative z-30 h-full p-6 md:p-8 flex flex-col justify-end text-left">
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
            box-shadow: 0 10px 24px -8px rgba(0,0,0,0.25) !important;
            opacity: 1 !important;
          }
        }
      `,
        }}
      />
    </section>
  );
}
