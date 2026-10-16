import * as React from 'react';
import { ScrollReveal } from '../../components/scroll-reveal';
import { Grid } from '@qbm/ui';
import type { Prisma } from '@qbm/database';

type ProductWithMedia = Prisma.ProductGetPayload<{
  include: { image: true; category: true };
}>;

interface PopularPreviewProps {
  products: ProductWithMedia[];
}

export function PopularPreview({ products }: PopularPreviewProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="relative w-full bg-[#BC1D1A] pt-0 pb-16 md:py-24">
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Mobile-only Sticky Header:
            Pins at top-[64px] (below sticky 64px mobile header) with compact vertical footprint.
            Releases naturally at the end of the section. Static on desktop. */}
        <div className="sticky top-[64px] z-20 md:static bg-[#BC1D1A]/95 backdrop-blur-md md:bg-transparent -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pt-3 pb-3 md:pt-0 md:pb-0 mb-6 md:mb-16 transition-colors">
          <ScrollReveal animation="heading">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <span className="text-[#FDFADB]/70 uppercase tracking-[0.15em] text-[11px] sm:text-xs font-bold font-sans mb-1 md:mb-4 block">
                Customer Favorites
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#FDFADB]">
                Most Loved
              </h2>
            </div>
          </ScrollReveal>
        </div>

        <Grid cols={1} gap="lg" className="sm:grid-cols-2 lg:grid-cols-4">
          {products.map((item, idx) => {
            const imageUrl = item.image ? item.image.secureUrl || item.image.originalUrl : null;
            // Stagger: (idx % 4) * 70ms (0ms, 70ms, 140ms, 210ms)
            const delayMs = (idx % 4) * 70;

            return (
              <ScrollReveal key={item.id} delayMs={delayMs} animation="card">
                <div className="group flex flex-col h-full bg-[#FDFADB] rounded-2xl sm:rounded-3xl p-4 md:p-5 border border-[#BC1D1A]/12 shadow-[0_12px_32px_-8px_rgba(40,3,3,0.22),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_22px_48px_-10px_rgba(40,3,3,0.35),0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300">
                  <div className="relative aspect-[4/3] md:aspect-[4/5] rounded-xl sm:rounded-2xl bg-brand-deep-cream mb-4 md:mb-6 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.image?.altText || item.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-brand-deep-cream transition-transform duration-1000 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 px-1">
                    <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#BC1D1A] font-bold mb-2 md:mb-3">
                      {item.category?.name || 'Uncategorized'}
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-[#BC1D1A] mb-2 md:mb-3 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[#BC1D1A]/80 font-sans font-light line-clamp-2 leading-relaxed">
                      {item.shortDescription}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </Grid>
      </div>
    </section>
  );
}
