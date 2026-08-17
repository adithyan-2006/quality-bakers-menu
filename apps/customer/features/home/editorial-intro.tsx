import * as React from 'react';
import Link from 'next/link';
import { buttonVariants, cn } from '@qbm/ui';
import { PageSection } from '../../components/layout/page-section';
import { ScrollReveal } from '../../components/scroll-reveal';
import type { Prisma } from '@qbm/database';

type HomepageWithRelations = Prisma.HomepageGetPayload<{
  include: { heroImage: true };
}>;

interface EditorialIntroProps {
  homepage: HomepageWithRelations;
  businessName: string;
  logoUrl?: string | null | undefined;
}

export function EditorialIntro({ homepage, businessName, logoUrl }: EditorialIntroProps) {
  return (
    <PageSection className="relative flex min-h-[90vh] md:min-h-screen items-center justify-center pt-8 md:pt-16 pb-16 overflow-hidden">
      {/* Background Image */}
      {homepage.heroImage && (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${homepage.heroImage.secureUrl || homepage.heroImage.originalUrl})`,
            }}
          />
          <div className="absolute inset-0 z-0 bg-background/80 md:bg-background/60" />
        </>
      )}

      <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 mt-[-10vh] relative z-10">
        <ScrollReveal animation="fade-in">
          <div className="mb-6 md:mb-10 w-16 h-16 md:w-24 md:h-24 rounded-full border border-border/50 flex items-center justify-center bg-background/80 overflow-hidden backdrop-blur-sm shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="font-serif text-2xl md:text-3xl font-light italic">
                {businessName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={200}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            {homepage.heroTitle} <br className="hidden sm:inline" />
            <span className="text-muted-foreground italic font-light">{homepage.heroSubtitle}</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={400}>
          <p className="text-lg md:text-xl text-muted-foreground font-light mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed">
            {/* The old design had a fixed text here, but the homepage model has no heroDescription. We can render a fallback if nothing else fits. */}
            Experience our meticulously crafted menu, featuring everything from fresh fruit salads
            to signature faloodas, prepared daily with uncompromising quality.
          </p>
        </ScrollReveal>

        <ScrollReveal animation="scale-up" delayMs={600}>
          <Link
            href={homepage.heroCtaLink || '/categories'}
            className={cn(
              buttonVariants({ variant: 'primary', size: 'lg' }),
              'px-10 py-6 text-lg rounded-full font-serif font-medium tracking-wide shadow-md hover:shadow-lg transition-all duration-300',
            )}
          >
            {homepage.heroCtaText || 'Browse the Menu'}
          </Link>
        </ScrollReveal>
      </div>
    </PageSection>
  );
}
