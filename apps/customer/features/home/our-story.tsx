import * as React from 'react';
import { PageSection } from '../../components/layout/page-section';
import { ScrollReveal } from '../../components/scroll-reveal';

interface OurStoryProps {
  title?: string | null;
  description?: string | null;
}

export function OurStory({ title, description }: OurStoryProps) {
  if (!title && !description) return null;

  return (
    <PageSection className="relative py-24 md:py-32 px-4 bg-stone-50 dark:bg-stone-900/30 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start md:justify-between gap-12 md:gap-24">
        {/* Left side: Eyebrow and Title */}
        <div className="w-full md:w-5/12 flex flex-col items-center md:items-start text-center md:text-left">
          <ScrollReveal animation="fade-up">
            <span className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-6 block">
              Our Story
            </span>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={150}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-foreground leading-[1.1]">
              {title}
            </h2>
          </ScrollReveal>
        </div>

        {/* Right side: Description and Decorative element */}
        <div className="w-full md:w-6/12 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-12">
          <ScrollReveal animation="fade-up" delayMs={300}>
            <p className="text-lg md:text-2xl text-muted-foreground font-light leading-relaxed whitespace-pre-wrap max-w-2xl">
              {description}
            </p>
          </ScrollReveal>

          {/* Subtle decorative divider */}
          <ScrollReveal animation="fade-up" delayMs={450}>
            <div className="mt-12 w-24 h-[1px] bg-border mx-auto md:mx-0"></div>
          </ScrollReveal>
        </div>
      </div>
    </PageSection>
  );
}
