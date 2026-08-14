import * as React from 'react';
import { PageSection } from '../../components/layout/page-section';
import { SectionTitle } from '../../components/layout/section-title';
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
    <PageSection className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 md:py-20 border-y border-border/40 bg-secondary/10">
      <ScrollReveal>
        <SectionTitle className="text-center md:text-left">Most Loved</SectionTitle>
      </ScrollReveal>

      <Grid cols={1} gap="lg" className="sm:grid-cols-2 lg:grid-cols-4 mt-8 md:mt-12">
        {products.map((item, idx) => {
          const imageUrl = item.image ? item.image.secureUrl || item.image.originalUrl : null;

          return (
            <ScrollReveal key={item.id} delayMs={idx * 150} animation="fade-up">
              <div className="group flex flex-col h-full bg-background rounded-xl p-4 md:p-5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative aspect-square rounded-lg bg-muted mb-5 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.image?.altText || item.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-secondary/50 transition-transform duration-700 group-hover:scale-105" />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {item.category?.name || 'Uncategorized'}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light line-clamp-2 leading-relaxed mb-4">
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
