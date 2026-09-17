import * as React from 'react';
import { ScrollReveal } from '../../components/scroll-reveal';
import { buttonVariants, cn } from '@qbm/ui';
import { TopScrollLink } from '../../components/top-scroll-link';

export function BrowseCta() {
  return (
    <section className="relative w-full bg-background min-h-[calc(100svh-64px)] md:min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-16 md:py-24 text-center">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center my-auto">
        <ScrollReveal animation="fade-up">
          <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-brand-cream mb-6 md:mb-8">
            Ready to Order?
          </h2>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={150}>
          <p className="text-lg md:text-2xl text-brand-cream/80 font-serif font-light mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
            Explore our complete digital menu and discover your next favorite treat. Prepared fresh,
            served with love.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="scale-up" delayMs={300}>
          <TopScrollLink
            href="/categories"
            className={cn(
              buttonVariants({ variant: 'primary', size: 'lg' }),
              'px-10 py-6 md:px-12 md:py-7 text-sm md:text-base rounded-full bg-brand-brick-red hover:bg-brand-red text-brand-cream font-sans uppercase tracking-widest transition-all duration-500 border-none shadow-lg hover:shadow-xl',
            )}
          >
            View Complete Menu
          </TopScrollLink>
        </ScrollReveal>
      </div>
    </section>
  );
}
