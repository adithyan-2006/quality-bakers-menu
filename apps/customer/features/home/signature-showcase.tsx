'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@qbm/ui';
import { ProductCard } from '../menu/product/product-card';
import type { MenuProduct } from '../menu/types';

interface SignatureShowcaseProps {
  products: MenuProduct[];
}

export function SignatureShowcase({ products }: SignatureShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const numCards = products.length;
    if (!container || numCards <= 1) return;

    // Scroll weight per card step (65vh) and hold on the final card (85vh)
    const stepWeight = 65;
    const holdWeight = 85;
    const totalWeight = (numCards - 1) * stepWeight + holdWeight;

    // Transition boundaries between cards in normalized [0, 1] progress
    const boundaries: number[] = [];
    for (let i = 1; i < numCards; i++) {
      boundaries.push((i * stepWeight) / totalWeight);
    }

    // Deadband hysteresis buffer to prevent any flicker near boundaries
    const buffer = 0.015;

    let rafId: number | null = null;

    const updateActiveCard = () => {
      const rect = container.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 768;
      const stickyTop = isDesktop ? 64 : 52;
      const scrolled = stickyTop - rect.top;
      const scrollable = rect.height - (window.innerHeight - stickyTop);

      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, scrolled / scrollable));

      setActiveIndex((prev) => {
        let nextIndex = prev;
        // Advance forward if progress exceeds boundary + buffer
        while (
          nextIndex < numCards - 1 &&
          boundaries[nextIndex] !== undefined &&
          progress > (boundaries[nextIndex] as number) + buffer
        ) {
          nextIndex++;
        }
        // Step backward if progress falls below boundary - buffer
        while (
          nextIndex > 0 &&
          boundaries[nextIndex - 1] !== undefined &&
          progress < (boundaries[nextIndex - 1] as number) - buffer
        ) {
          nextIndex--;
        }
        return nextIndex;
      });
    };

    const onScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateActiveCard();
      });
    };

    // Initial evaluation on mount
    updateActiveCard();

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <section
        id="signature"
        className="relative bg-[#BC1D1A] text-brand-cream py-20 px-6 text-center scroll-mt-[64px] md:scroll-mt-[72px] lg:scroll-mt-[76px]"
      >
        <span className="block text-xs tracking-[0.25em] uppercase font-sans font-semibold opacity-75 mb-3">
          Signature
        </span>
        <h2 className="font-serif font-bold text-3xl md:text-5xl text-[#FDFADB] mb-4">
          Crafted to Be Remembered
        </h2>
        <p className="text-sm md:text-base font-sans text-brand-cream/85 max-w-md mx-auto">
          Our signature collection is being refreshed with new artisanal creations. Check back soon!
        </p>
      </section>
    );
  }

  return (
    <section
      id="signature"
      className="relative bg-[#BC1D1A] text-brand-cream scroll-mt-[64px] md:scroll-mt-[72px] lg:scroll-mt-[76px]"
      ref={containerRef}
    >
      {/* STICKY UI PANEL — sits below the header (64px mobile, 72px md, 76px lg) */}
      <div className="sticky top-[64px] md:top-[72px] lg:top-[76px] h-[calc(100vh-64px)] md:h-[calc(100vh-72px)] lg:h-[calc(100vh-76px)] z-10 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">
          {/* LEFT: Editorial */}
          <div className="flex flex-col justify-center w-full md:w-[45%] px-6 py-6 md:px-12 md:py-12 lg:px-16 lg:py-16 flex-shrink-0">
            <span className="block text-[10px] md:text-xs tracking-[0.25em] uppercase font-sans font-semibold opacity-75 mb-3 md:mb-4">
              Signature
            </span>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#FDFADB] leading-[1.1] mb-4 md:mb-5">
              Crafted to Be
              <br />
              Remembered.
            </h2>

            <p className="text-sm md:text-base font-sans text-brand-cream/85 leading-relaxed max-w-xs md:max-w-sm mb-6 md:mb-8">
              Every dawn, our culinary team selects orchard-fresh fruits and unadulterated farmstead
              milk — never heated, never processed, always crafted with uncompromising care.
            </p>

            <div className="flex items-center gap-3 pt-4 md:pt-6 border-t-0 md:border-t border-brand-cream/20">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-cream/40 flex items-center justify-center flex-shrink-0 text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                QB
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-medium text-sm md:text-base leading-tight">
                  Quality Bakers Signature Collection
                </span>
                <span className="text-[9px] md:text-[10px] font-sans tracking-wide opacity-60 uppercase mt-0.5">
                  Master Bakers · Seasonal Recipes · House Specials
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product card */}
          <div className="flex-1 flex items-center justify-center px-6 pb-6 md:px-10 md:py-12 lg:px-14 lg:py-12">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
              {products.map((product, idx) => (
                <div
                  key={product.id}
                  className={cn(
                    'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
                    idx === 0 ? 'relative' : 'absolute inset-0',
                    activeIndex === idx
                      ? 'opacity-100 translate-y-0 scale-100 z-10'
                      : activeIndex > idx
                        ? 'opacity-0 -translate-y-4 scale-[0.98] z-0 pointer-events-none'
                        : 'opacity-0 translate-y-4 scale-[0.98] z-0 pointer-events-none',
                  )}
                  aria-hidden={activeIndex !== idx}
                >
                  <ProductCard
                    product={product}
                    themeClasses={{
                      card: 'bg-[#FDFADB] border border-[#BC1D1A]/15 rounded-2xl sm:rounded-3xl shadow-[0_20px_45px_-10px_rgba(40,3,3,0.42),0_10px_20px_-4px_rgba(0,0,0,0.18)]',
                      cardHover: 'hover:shadow-[0_28px_60px_-12px_rgba(40,3,3,0.52)]',
                      heading: 'text-[#BC1D1A]',
                      description: 'text-[#BC1D1A]/80',
                      section: 'bg-[#FDFADB]',
                      accent: 'text-brand-brick-red',
                      badge: '',
                      divider: 'border-black/15',
                      price: 'text-brand-dark',
                      subheading: '',
                    }}
                    presentationStyle="signature-standard"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SCROLL TRACK SPACER
          Deterministic scroll distance per card step plus a generous hold on the final card.
      */}
      <div
        aria-hidden="true"
        style={{
          height: products.length > 1 ? `${(products.length - 1) * 65 + 85}vh` : '0px',
        }}
      />
    </section>
  );
}
