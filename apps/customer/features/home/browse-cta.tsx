import * as React from 'react';
import { PageSection } from '../../components/layout/page-section';
import { ScrollReveal } from '../../components/scroll-reveal';
import { buttonVariants, cn } from '@qbm/ui';
import { TopScrollLink } from '../../components/top-scroll-link';

export function BrowseCta() {
  return (
    <PageSection className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-16 md:py-32 text-center">
      <ScrollReveal animation="fade-up">
        <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-6">
          Ready to Order?
        </h2>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delayMs={150}>
        <p className="text-lg md:text-xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto">
          Explore our complete digital menu and discover your next favorite treat. Prepared fresh,
          served with love.
        </p>
      </ScrollReveal>

      <ScrollReveal animation="scale-up" delayMs={300}>
        <TopScrollLink
          href="/categories"
          className={cn(
            buttonVariants({ variant: 'primary', size: 'lg' }),
            'px-12 py-6 text-lg rounded-full font-serif shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
          )}
        >
          View Complete Menu
        </TopScrollLink>
      </ScrollReveal>
    </PageSection>
  );
}
