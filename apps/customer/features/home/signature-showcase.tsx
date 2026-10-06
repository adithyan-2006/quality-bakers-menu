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
    if (!container) return;

    const spies = container.querySelectorAll<HTMLElement>('.sig-spy');

    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry) {
          const idx = Number((bestEntry.target as HTMLElement).dataset.index);
          setActiveIndex(idx);
        }
      },
      {
        root: null,
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0,
      },
    );

    spies.forEach((spy) => observer.observe(spy));
    return () => spies.forEach((spy) => observer.unobserve(spy));
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section
      id="signature"
      className="relative bg-[#BC1D1A] text-brand-cream scroll-mt-[52px] md:scroll-mt-[64px]"
      ref={containerRef}
    >
      {/* STICKY UI PANEL — sits below the compact header (52px mobile, 64px desktop) */}
      <div className="sticky top-[52px] md:top-[64px] h-[calc(100vh-52px)] md:h-[calc(100vh-64px)] z-10 overflow-hidden">
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
                    'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    idx === 0 ? 'relative' : 'absolute inset-0',
                    activeIndex === idx
                      ? 'opacity-100 translate-y-0 scale-100 z-10'
                      : activeIndex > idx
                        ? 'opacity-0 -translate-y-6 scale-[0.97] z-0 pointer-events-none'
                        : 'opacity-0 translate-y-6 scale-[0.97] z-0 pointer-events-none',
                  )}
                  aria-hidden={activeIndex !== idx}
                >
                  <ProductCard
                    product={product}
                    themeClasses={{
                      card: 'bg-[#FDFADB] border border-brand-cream/20 shadow-lg',
                      cardHover: 'hover:shadow-xl',
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

      {/* SCROLL SPY TRACK
          - Spy 0 is SHORT (15vh): Product 1 is already active on entry,
            so its spy only needs to hold briefly before Spy 1 enters.
            This eliminates the entry dead zone before the first transition.
          - Spies 1..N remain at 55vh — product-to-product timing unchanged.
          - Tail is 5vh: just enough to feel stable before releasing.
            This eliminates the exit dead zone after returning to Product 1.
      */}
      <div aria-hidden="true">
        {products.map((_, idx) => (
          <div
            key={idx}
            data-index={idx}
            className="sig-spy w-full"
            style={{ height: idx === 0 ? '15vh' : '55vh' }}
          />
        ))}
        <div style={{ height: '5vh' }} />
      </div>
    </section>
  );
}
