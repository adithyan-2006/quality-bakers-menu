import * as React from 'react';

import { ScrollReveal } from '../../components/scroll-reveal';
import { cn } from '@qbm/ui';
import type { Prisma } from '@qbm/database';
import { TopScrollLink } from '../../components/top-scroll-link';

interface SignatureHighlightProps {
  title?: string | null;
  description?: string | null;
  image?: Prisma.MediaGetPayload<Record<string, unknown>> | null;
}

export function SignatureHighlight({ title, description }: SignatureHighlightProps) {
  return (
    <section
      id="about"
      className="relative w-full bg-[#BC1D1A] min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] lg:min-h-[calc(100vh-76px)] flex items-center justify-center py-16 md:py-32 scroll-mt-[64px] md:scroll-mt-[72px] lg:scroll-mt-[76px]"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
        <ScrollReveal animation="fade-up">
          <span className="text-sm uppercase tracking-widest text-[#FDFADB]/70 font-medium mb-6 block">
            About Us
          </span>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={150}>
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-[#FDFADB] mb-8 leading-tight max-w-2xl">
            {title || 'Our Story'}
          </h2>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={300}>
          <p className="text-lg md:text-xl text-[#FDFADB]/80 font-light leading-relaxed mb-12 whitespace-pre-wrap max-w-3xl">
            {description || 'Experience the taste of quality baking.'}
          </p>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delayMs={450}>
          <TopScrollLink
            href="/categories"
            className={cn(
              'inline-flex items-center justify-center',
              'px-8 sm:px-10 md:px-11 py-3.5 sm:py-4 rounded-full',
              'bg-[#FDFADB]',
              'text-[#BC1D1A]',
              'font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.18em] sm:tracking-[0.2em]',
              'shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:shadow-md',
              'hover:scale-105 active:scale-95 transition-all duration-300 select-none',
            )}
          >
            <span>EXPLORE MENU</span>
          </TopScrollLink>
        </ScrollReveal>
      </div>
    </section>
  );
}
