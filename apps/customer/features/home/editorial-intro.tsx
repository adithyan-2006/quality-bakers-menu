import * as React from 'react';
import Link from 'next/link';
import { buttonVariants, cn } from '@qbm/ui';
import { ArrowRight } from 'lucide-react';

import { ScrollReveal } from '../../components/scroll-reveal';
import { ContentContainer } from '../../components/layout/content-container';
import { DrippingAnimation } from './dripping-animation';
import type { Prisma } from '@qbm/database';

type HomepageWithRelations = Prisma.HomepageGetPayload<{
  include: { heroImage: true; aboutImage: true };
}>;

interface EditorialIntroProps {
  homepage: HomepageWithRelations;
  businessName: string;
  logoUrl?: string | null | undefined;
}

export function EditorialIntro({
  homepage,
  businessName: _businessName,
  logoUrl: _logoUrl,
}: EditorialIntroProps) {
  return (
    <section
      id="home"
      className="relative w-full bg-[#BC1D1A] flex flex-col min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] min-h-[calc(100dvh-64px)] md:min-h-[calc(100dvh-80px)]"
    >
      {/* Living Melted Header Dripping & Natural Splash Animation */}
      <DrippingAnimation />

      {/* Top Banner (Marquee) */}
      <div className="w-full border-b border-[#FDFADB]/15 py-2.5 sm:py-3 md:py-3.5 flex items-center overflow-hidden flex-shrink-0 bg-[#BC1D1A] z-20 relative mt-5 sm:mt-6 md:mt-7">
        <div className="flex whitespace-nowrap animate-marquee motion-reduce:animate-none w-max">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="flex items-center">
              <span className="text-[#FDFADB] uppercase text-[10px] sm:text-xs tracking-[0.25em] opacity-90 font-medium font-sans px-4">
                USE COLD MACERATED SPICED SYRUPS
              </span>
              <span className="text-[#FDFADB]/50 text-[10px] sm:text-xs px-2">✦</span>
              <span className="text-[#FDFADB] uppercase text-[10px] sm:text-xs tracking-[0.25em] opacity-90 font-medium font-sans px-4">
                FRESHLY BAKED DAILY
              </span>
              <span className="text-[#FDFADB]/50 text-[10px] sm:text-xs px-2">✦</span>
              <span className="text-[#FDFADB] uppercase text-[10px] sm:text-xs tracking-[0.25em] opacity-90 font-medium font-sans px-4">
                UNCOMPROMISING QUALITY
              </span>
              <span className="text-[#FDFADB]/50 text-[10px] sm:text-xs px-2">✦</span>
            </span>
          ))}
        </div>
        {/* Accent Bar Segment on bottom border matching Reference Panel 5 */}
        <div className="absolute bottom-0 left-0 w-28 sm:w-36 md:w-44 h-[3px] bg-[#F9E6CE] rounded-r-sm pointer-events-none" />
      </div>

      {/* Main Hero Content */}
      <ContentContainer className="relative flex flex-col lg:flex-row items-stretch lg:items-center flex-1 pt-3 pb-6 sm:pt-4 sm:pb-6 lg:pt-6 lg:pb-8 gap-6 lg:gap-12">
        {/* Left Column: Typography & Content */}
        <div className="flex flex-col justify-center text-left relative z-10 w-full lg:w-7/12 xl:w-2/3 flex-shrink-0">
          <ScrollReveal animation="fade-up">
            <span className="inline-block mt-1 md:mt-2 mb-2 md:mb-4 text-[#FDFADB]/70 uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold font-sans">
              EST. 2026
            </span>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={100}>
            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] font-serif font-bold tracking-tight text-[#FDFADB] mb-4 md:mb-6 leading-[1.05] text-balance">
              {homepage.heroTitle}{' '}
              <span className="text-[#FDFADB] italic font-medium block mt-1 md:mt-2">
                {homepage.heroSubtitle}
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={200}>
            <p className="text-lg md:text-xl xl:text-2xl text-[#FDFADB]/80 font-sans font-light mb-6 md:mb-8 max-w-xl xl:max-w-2xl leading-relaxed">
              Experience our meticulously crafted menu, featuring everything from fresh fruit salads
              to signature faloodas, prepared daily with uncompromising quality.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delayMs={300}>
            <Link
              href={homepage.heroCtaLink || '/categories'}
              className={cn(
                buttonVariants({ variant: 'primary', size: 'lg' }),
                'px-8 h-[64px] text-base rounded-full bg-[#FFF4D6] hover:bg-[#FFF4D6]/90 text-[#C91F1F] border-none font-sans font-medium tracking-wide transition-all duration-300 w-[240px] flex items-center justify-between group',
              )}
            >
              <span>{homepage.heroCtaText || 'Explore Menu'}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>

        {/* Right Column: Imagery */}
        {homepage.heroImage ? (
          <div className="w-full lg:w-5/12 xl:w-1/3 flex-1 lg:flex-none lg:self-stretch min-h-[200px] relative z-0 flex items-center justify-center my-4 lg:my-0">
            <ScrollReveal animation="scale-up" delayMs={200} className="w-full h-full">
              <div className="w-full h-full relative rounded-[2rem] overflow-hidden border border-border/10 shadow-2xl">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
                  style={{
                    backgroundImage: `url(${homepage.heroImage.secureUrl || homepage.heroImage.originalUrl})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
              </div>
            </ScrollReveal>
          </div>
        ) : null}
      </ContentContainer>
    </section>
  );
}
