import * as React from 'react';
import { PageSection } from '../../components/layout/page-section';
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
    <PageSection className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-0 pb-16 md:py-24 bg-brand-dark">
      {/* Mobile-only Sticky Header:
          Pins at top-[52px] (below compact 52px mobile header) on mobile throughout Most Loved section.
          Releases naturally at the end of the section. Static on desktop. */}
      <div className="sticky top-[52px] z-20 md:static bg-brand-dark/95 backdrop-blur-md md:bg-transparent -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pt-3 pb-4 md:pt-0 md:pb-0 mb-8 md:mb-16 transition-colors">
        <ScrollReveal animation="heading">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="text-brand-muted-foreground uppercase tracking-[0.15em] text-xs font-bold font-sans mb-2 md:mb-4 block">
              Customer Favorites
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-brand-cream">
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
              <div className="group flex flex-col h-full bg-brand-warm-cream rounded-2xl p-4 md:p-5 border border-black/5 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/3] md:aspect-[4/5] rounded-xl bg-brand-deep-cream mb-4 md:mb-6 overflow-hidden">
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
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-brand-brick-red font-bold mb-2 md:mb-3">
                    {item.category?.name || 'Uncategorized'}
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-dark mb-2 md:mb-3 group-hover:text-brand-brick-red transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-brand-dark/70 font-sans font-light line-clamp-2 leading-relaxed">
                    {item.shortDescription}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </Grid>
    </PageSection>
  );
}
