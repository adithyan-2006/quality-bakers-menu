import * as React from 'react';
import Link from 'next/link';
import { buttonVariants, cn } from '@qbm/ui';
import { PageSection } from '../../components/layout/page-section';
import { ScrollReveal } from '../../components/scroll-reveal';

export function EditorialIntro() {
  return (
    <PageSection className="relative flex min-h-[90vh] md:min-h-screen items-center justify-center pt-8 md:pt-16 pb-16">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 mt-[-10vh]">
        <ScrollReveal animation="fade-in">
          <div className="mb-6 md:mb-10 w-16 h-16 md:w-24 md:h-24 rounded-full border border-border/50 flex items-center justify-center bg-secondary/30">
            {/* Logo Placeholder */}
            <span className="font-serif text-2xl md:text-3xl font-light italic">QB</span>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={200}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Artisanal Baking & <br className="hidden sm:inline" />
            <span className="text-muted-foreground italic font-light">Craft Beverages</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={400}>
          <p className="text-lg md:text-xl text-muted-foreground font-light mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed">
            Experience our meticulously crafted menu, featuring everything from fresh fruit salads
            to signature faloodas, prepared daily with uncompromising quality.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="scale-up" delayMs={600}>
          <Link
            href="/categories"
            className={cn(
              buttonVariants({ variant: 'primary', size: 'lg' }),
              'px-10 py-6 text-lg rounded-full font-serif font-medium tracking-wide shadow-md hover:shadow-lg transition-all duration-300',
            )}
          >
            Browse the Menu
          </Link>
        </ScrollReveal>
      </div>
    </PageSection>
  );
}
