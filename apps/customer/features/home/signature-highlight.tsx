import * as React from 'react';
import { PageSection } from '../../components/layout/page-section';
import { ScrollReveal } from '../../components/scroll-reveal';
import { buttonVariants, cn } from '@qbm/ui';
import type { Prisma } from '@qbm/database';
import { TopScrollLink } from '../../components/top-scroll-link';

interface SignatureHighlightProps {
  title?: string | null;
  description?: string | null;
  image?: Prisma.MediaGetPayload<Record<string, unknown>> | null;
}

export function SignatureHighlight({ title, description }: SignatureHighlightProps) {
  if (!title && !description) return null;

  return (
    <PageSection
      id="about"
      className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-16 md:py-32 text-center"
    >
      <div className="flex flex-col items-center justify-center">
        <ScrollReveal animation="fade-up">
          <span className="text-sm uppercase tracking-widest text-primary font-medium mb-6 block">
            About Us
          </span>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={150}>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-8 leading-tight max-w-2xl">
            {title || 'Our Story'}
          </h2>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={300}>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-12 whitespace-pre-wrap max-w-3xl">
            {description || 'Experience the taste of quality baking.'}
          </p>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={450}>
          <TopScrollLink
            href="/categories"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'rounded-full px-10 py-6 text-lg hover:-translate-y-1 hover:shadow-md transition-all duration-300',
            )}
          >
            Explore Menu
          </TopScrollLink>
        </ScrollReveal>
      </div>
    </PageSection>
  );
}
