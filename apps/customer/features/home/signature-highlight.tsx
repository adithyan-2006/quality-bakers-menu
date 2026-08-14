import * as React from 'react';
import Link from 'next/link';
import { PageSection } from '../../components/layout/page-section';
import { ScrollReveal } from '../../components/scroll-reveal';
import { buttonVariants, cn } from '@qbm/ui';
import type { Prisma } from '@qbm/database';

interface SignatureHighlightProps {
  title?: string | null;
  description?: string | null;
  image?: Prisma.MediaGetPayload<Record<string, unknown>> | null;
}

export function SignatureHighlight({ title, description, image }: SignatureHighlightProps) {
  if (!title && !description && !image) return null;

  const imageUrl = image ? image.secureUrl || image.originalUrl : null;

  return (
    <PageSection id="about" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 md:py-24">
      <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <ScrollReveal animation="fade-up">
            <span className="text-sm uppercase tracking-widest text-primary font-medium mb-4 block">
              About Us
            </span>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={150}>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-6 leading-tight">
              {title || 'Our Story'}
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={300}>
            <p className="text-lg text-muted-foreground font-light leading-relaxed mb-8 whitespace-pre-wrap">
              {description || 'Experience the taste of quality baking.'}
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={450}>
            <Link
              href="/categories"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-full px-8',
              )}
            >
              Explore Menu
            </Link>
          </ScrollReveal>
        </div>

        <div className="order-1 md:order-2">
          <ScrollReveal animation="scale-up" delayMs={200}>
            <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden bg-muted shadow-2xl">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={image?.altText || title || 'About us'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-muted" />
              )}
              <div className="absolute inset-0 bg-black/5" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageSection>
  );
}
