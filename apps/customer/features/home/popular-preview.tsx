import * as React from 'react';
import Link from 'next/link';
import { PageSection } from '../../components/layout/page-section';
import { SectionTitle } from '../../components/layout/section-title';
import { ScrollReveal } from '../../components/scroll-reveal';
import { Grid } from '@qbm/ui';

const PREVIEW_ITEMS = [
  {
    name: 'Royal Falooda',
    category: 'Falooda',
    desc: 'Layered with rose syrup, vermicelli, sweet basil seeds, and premium ice cream.',
  },
  {
    name: 'Mango Smooth',
    category: 'Smoothies',
    desc: 'Fresh alphonso mangoes blended with rich greek yogurt and honey.',
  },
  {
    name: 'Oreo Crush',
    category: 'Biscuit Shake',
    desc: 'Crushed Oreo cookies mixed with thick vanilla ice cream and chocolate drizzle.',
  },
  {
    name: 'Mint Mojito',
    category: 'Mojito',
    desc: 'Refreshing muddled mint, fresh lime, and sparkling soda.',
  },
];

export function PopularPreview() {
  return (
    <PageSection className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 md:py-20 border-y border-border/40 bg-secondary/10">
      <ScrollReveal>
        <SectionTitle className="text-center md:text-left">Most Loved</SectionTitle>
      </ScrollReveal>

      <Grid cols={1} gap="lg" className="sm:grid-cols-2 lg:grid-cols-4">
        {PREVIEW_ITEMS.map((item, idx) => (
          <ScrollReveal key={item.name} delayMs={idx * 150} animation="fade-up">
            <Link
              href={`/products/${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group flex flex-col h-full bg-background rounded-xl p-4 md:p-5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square rounded-lg bg-muted mb-5 overflow-hidden">
                <div className="w-full h-full bg-secondary/50 transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {item.category}
                </span>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground font-light line-clamp-2 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </Grid>
    </PageSection>
  );
}
