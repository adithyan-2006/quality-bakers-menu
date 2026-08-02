import * as React from 'react';
import Link from 'next/link';
import { PageSection } from '../../components/layout/page-section';
import { ScrollReveal } from '../../components/scroll-reveal';
import { buttonVariants, cn } from '@qbm/ui';

export function SignatureHighlight() {
  return (
    <PageSection className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 md:py-24">
      <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <ScrollReveal animation="fade-up">
            <span className="text-sm uppercase tracking-widest text-primary font-medium mb-4 block">
              Chef's Recommendation
            </span>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={150}>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-6 leading-tight">
              The <br className="hidden md:inline" /> Premium Nut Shake
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={300}>
            <p className="text-lg text-muted-foreground font-light leading-relaxed mb-8">
              A masterful blend of roasted almonds, cashews, and pistachios, perfectly balanced with
              Medjool dates and thick cream. A rich, fulfilling experience crafted for connoisseurs.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={450}>
            <Link
              href="/categories/nuts-shake"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-full px-8',
              )}
            >
              Explore Nuts Shakes
            </Link>
          </ScrollReveal>
        </div>

        <div className="order-1 md:order-2">
          <ScrollReveal animation="scale-up" delayMs={200}>
            <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden bg-muted shadow-2xl">
              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-muted" />
              <div className="absolute inset-0 bg-black/5" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageSection>
  );
}
