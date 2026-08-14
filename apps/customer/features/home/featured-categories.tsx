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
  const trackRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const cardsRef = React.useRef<(HTMLAnchorElement | null)[]>([]);

  // Animation state for lerping
  const scrollTarget = React.useRef(0);
  const currentScroll = React.useRef(0);
  const rafId = React.useRef<number | null>(null);

  // Stops for pacing
  const stopsRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const onScroll = () => {
      if (!containerRef.current || !trackRef.current) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const scrollableDistance = height - windowHeight;
      const scrolled = -top;

      let progress = 0;
      if (scrolled > 0 && scrollableDistance > 0) {
        progress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);
      } else if (scrolled > scrollableDistance) {
        progress = 1;
      }

      // Calculate max track distance based on content width vs viewport
      const trackScrollWidth = trackRef.current.scrollWidth;
      const maxDistance = Math.max(
        0,
        trackScrollWidth - window.innerWidth + window.innerWidth * 0.2,
      );

      const rawTarget = progress * maxDistance;
      let pacedTarget = rawTarget;

      // Build stop points on first scroll
      if (stopsRef.current.length === 0 && trackRef.current) {
        const currentTransform = trackRef.current.style.transform;
        trackRef.current.style.transform = 'none';

        const viewportCenter = window.innerWidth / 2;
        const stops: number[] = [];
        cardsRef.current.forEach((card) => {
          if (!card) return;
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const requiredScroll = cardCenter - viewportCenter;
          if (requiredScroll >= 0) stops.push(requiredScroll);
        });

        trackRef.current.style.transform = currentTransform;
        stopsRef.current = stops;
      }

      // Apply pacing distortion (magnetic plateaus)
      if (stopsRef.current.length > 0) {
        let closestStop = stopsRef.current[0] ?? 0;
        let minDiff = Math.abs(rawTarget - closestStop);

        for (let i = 1; i < stopsRef.current.length; i++) {
          const currentStop = stopsRef.current[i] ?? 0;
          const diff = Math.abs(rawTarget - currentStop);
          if (diff < minDiff) {
            minDiff = diff;
            closestStop = currentStop;
          }
        }

        const delta = rawTarget - closestStop;
        const radius = window.innerWidth < 768 ? 160 : 200;

        if (Math.abs(delta) < radius) {
          const normalized = delta / radius;
          // Cubic easing for a very calm "arrive -> pause -> continue" feeling
          const distorted = Math.pow(normalized, 3) * radius;
          pacedTarget = closestStop + distorted;
        }
      }

      scrollTarget.current = pacedTarget;

      // Handle Entry Animation (Opacity and TranslateY on header and track)
      if (headerRef.current && trackRef.current) {
        // Entry progress from -200px (before sticky) to 0 (sticky starts)
        const entryProgress = Math.min(
          Math.max((scrolled + windowHeight / 2) / (windowHeight / 2), 0),
          1,
        );

        if (scrolled < 0) {
          // Fade in and slide up
          headerRef.current.style.opacity = `${entryProgress}`;
          headerRef.current.style.transform = `translate3d(0, ${(1 - entryProgress) * 40}px, 0)`;
          trackRef.current.style.opacity = `${entryProgress}`;
          trackRef.current.style.transform = `translate3d(0, ${(1 - entryProgress) * 60}px, 0)`;
        } else {
          headerRef.current.style.opacity = `1`;
          headerRef.current.style.transform = `translate3d(0, 0, 0)`;
          trackRef.current.style.opacity = `1`;
        }
      }
    };

    const renderLoop = () => {
      // Ultra-smooth heavy lerp
      currentScroll.current += (scrollTarget.current - currentScroll.current) * 0.05;

      if (Math.abs(scrollTarget.current - currentScroll.current) < 0.1) {
        currentScroll.current = scrollTarget.current;
      }

      // Horizontal track translation
      if (trackRef.current && containerRef.current) {
        const { top } = containerRef.current.getBoundingClientRect();
        // Only apply horizontal transform if we are in the sticky zone or past it
        if (top <= 0) {
          trackRef.current.style.transform = `translate3d(-${currentScroll.current}px, 0, 0)`;
        }
      }

      // Center Focus Experience: scale cards based on proximity to viewport center
      const viewportCenterX = window.innerWidth / 2;

      cardsRef.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;

        // Distance from center
        const distance = Math.abs(viewportCenterX - cardCenterX);

        // Normalize distance (0 is at center, 1 is at edge of screen)
        // We use a tighter radius for visual falloff so the center card really pops
        const visualRadius =
          window.innerWidth < 768 ? window.innerWidth * 0.6 : window.innerWidth * 0.4;
        const normalizedDistance = Math.min(distance / visualRadius, 1);

        // Intensity curve (1 at center, 0 at edge)
        const intensity = 1 - normalizedDistance;

        // Scale from 1.00 to 1.05
        const scale = 1 + 0.05 * intensity;
        // Opacity from 0.4 to 1.0
        const opacity = 0.4 + 0.6 * intensity;
        // Brightness from 0.7 to 1.1
        const brightness = 0.7 + 0.4 * intensity;
        // Dynamic heavy shadow for the centered card
        const shadowOpacity = 0.4 * intensity;
        const shadowY = 30 * intensity;
        const shadowBlur = 60 * intensity;

        const imageWrapper = card.querySelector('.focus-scale') as HTMLElement;
        const imageBg = card.querySelector('.focus-image') as HTMLElement;

        if (imageWrapper) {
          imageWrapper.style.transform = `scale(${scale})`;
          imageWrapper.style.opacity = `${opacity}`;
          imageWrapper.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px -15px rgba(0,0,0,${shadowOpacity})`;
        }
        if (imageBg) {
          imageBg.style.filter = `brightness(${brightness})`;
        }
      });

      rafId.current = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial calls
    onScroll();
    rafId.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (!categories || categories.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-background"
      style={{ minHeight: '220vh' }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center pt-8 pb-20 md:pt-12 md:pb-24">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-10 md:mb-16 will-change-transform opacity-0"
        >
          <SectionTitle className="text-left">Explore Collections</SectionTitle>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground font-light max-w-xl">
            A handcrafted selection of our signature drinks and desserts.
          </p>
        </div>

        {/* Single Horizontal Gallery */}
        <div className="w-full relative">
          <div
            ref={trackRef}
            className="flex items-center gap-6 md:gap-10 px-6 lg:px-8 w-max will-change-transform opacity-0"
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
                  className="explore-card group relative block w-[280px] sm:w-[300px] md:w-[360px] aspect-[4/5] flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                >
                  {/* Scalable Container for Center Focus */}
                  <div className="focus-scale w-full h-full relative overflow-hidden rounded-2xl border border-border/40 will-change-transform">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-20" />

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.coverImage?.altText || category.name}
                        className="focus-image absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105 will-change-transform"
                      />
                    ) : (
                      <div className="focus-image absolute inset-0 bg-muted/80 z-10 transition-transform duration-700 group-hover:scale-105 will-change-transform" />
                    )}

                    {/* Content (Bottom Anchored) */}
                    <div className="relative z-30 h-full p-6 md:p-8 flex flex-col justify-end text-left">
                      <h3 className="font-serif text-2xl md:text-3xl font-medium text-white drop-shadow-md tracking-wide mb-1">
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
          }
        }
      `,
        }}
      />
    </section>
  );
}
