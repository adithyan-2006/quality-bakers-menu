import * as React from 'react';
import { cn } from '@qbm/ui';
import { TopScrollLink } from '../../components/top-scroll-link';

import { ScrollReveal } from '../../components/scroll-reveal';
import { ContentContainer } from '../../components/layout/content-container';
import { DrippingAnimation } from './dripping-animation';
import { QualityYouCanTasteMark } from '../../components/brand/quality-you-can-taste-mark';
import { QualityYouCanTasteMobileMark } from '../../components/brand/quality-you-can-taste-mobile-mark';
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
      className="relative w-full bg-[#BC1D1A] flex flex-col min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-72px)] lg:min-h-[calc(100vh-76px)] min-h-[calc(100dvh-64px)] md:min-h-[calc(100dvh-72px)] lg:min-h-[calc(100dvh-76px)] scroll-mt-[64px] md:scroll-mt-[72px] lg:scroll-mt-[76px]"
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
      </div>

      {/* Main Hero Content - Responsive Layout */}
      <ContentContainer className="relative flex flex-col flex-1 pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24 justify-center">
        {/* MOBILE VIEW (< md): Everything left-aligned, stacked 3-line big typography */}
        <div className="flex md:hidden flex-col items-start text-left w-full max-w-sm sm:max-w-md mx-auto px-2">
          {/* Top Line: quality bakers - since 2020 */}
          <ScrollReveal animation="fade-up" delayMs={100} className="w-full">
            <div className="flex items-center gap-2 sm:gap-2.5 w-full mb-3 select-none min-w-0">
              <span className="text-[#FDFADB]/90 uppercase font-sans text-[9px] min-[360px]:text-[10px] sm:text-[11px] tracking-[0.14em] min-[360px]:tracking-[0.2em] sm:tracking-[0.24em] font-medium truncate">
                QUALITY BAKERS - SINCE 2020
              </span>
              <span className="h-[1px] flex-1 min-w-[12px] max-w-[45px] bg-[#FDFADB]/35 shrink-0" />
            </div>
          </ScrollReveal>

          {/* Main Title: Quality \n you \n can taste (Stacked 3-line display matching mobile arrangement) */}
          <ScrollReveal animation="fade-up" delayMs={200} className="w-full">
            <h1 className="relative flex flex-col items-start w-full my-2">
              <span className="sr-only">Quality you can taste</span>
              <QualityYouCanTasteMobileMark className="w-full max-w-[340px] sm:max-w-[380px] h-auto text-[#FDFADB] select-none filter drop-shadow-[0_4px_22px_rgba(0,0,0,0.25)]" />
            </h1>
          </ScrollReveal>

          {/* CTA: Explore Menu button (Simple flat pill with minimal shadow and red text, no arrow, stable colors) */}
          <ScrollReveal animation="fade-up" delayMs={300} className="w-full flex justify-start">
            <TopScrollLink
              href={homepage.heroCtaLink || '/categories'}
              className={cn(
                'mt-6 sm:mt-7 inline-flex items-center justify-center',
                'px-8 sm:px-10 py-3.5 sm:py-4 rounded-full',
                'bg-[#FDFADB]',
                'text-[#BC1D1A]',
                'font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.18em] sm:tracking-[0.2em]',
                'shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:shadow-md',
                'hover:scale-105 active:scale-95 transition-all duration-300 select-none',
              )}
            >
              <span>
                {homepage.heroCtaText ? homepage.heroCtaText.toUpperCase() : 'EXPLORE MENU'}
              </span>
            </TopScrollLink>
          </ScrollReveal>
        </div>

        {/* DESKTOP / TABLET VIEW (>= md): Centered, wide single-line display */}
        <div className="hidden md:flex flex-col items-center justify-center text-center relative z-10 w-full max-w-5xl mx-auto px-4">
          {/* Top Line: Quality Bakers - Since 2020 flanked by subtle horizontal rules */}
          <ScrollReveal animation="fade-up" delayMs={100} className="w-full flex justify-center">
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full max-w-md md:max-w-xl mx-auto mb-3 sm:mb-4 md:mb-5">
              <span className="h-[1px] flex-1 max-w-[60px] sm:max-w-[80px] md:max-w-[110px] bg-[#FDFADB]/35" />
              <span className="text-[#FDFADB]/90 uppercase font-sans text-[10px] sm:text-xs md:text-sm tracking-[0.22em] sm:tracking-[0.26em] md:tracking-[0.3em] font-medium whitespace-nowrap select-none">
                QUALITY BAKERS - SINCE 2020
              </span>
              <span className="h-[1px] flex-1 max-w-[60px] sm:max-w-[80px] md:max-w-[110px] bg-[#FDFADB]/35" />
            </div>
          </ScrollReveal>

          {/* Main Title: Quality you can taste (Display size with ornate flourishes) */}
          <ScrollReveal animation="fade-up" delayMs={200} className="w-full flex justify-center">
            <h1 className="relative flex flex-col items-center justify-center w-full my-1 sm:my-2">
              <span className="sr-only">Quality you can taste</span>
              <QualityYouCanTasteMark className="w-[96%] sm:w-[92%] md:w-[88%] max-w-[540px] sm:max-w-[720px] md:max-w-[880px] lg:max-w-[980px] xl:max-w-[1040px] h-auto text-[#FDFADB] select-none filter drop-shadow-[0_4px_22px_rgba(0,0,0,0.22)]" />
            </h1>
          </ScrollReveal>

          {/* CTA: Explore Menu button (Simple flat pill with minimal shadow and red text, no arrow, stable colors) */}
          <ScrollReveal animation="fade-up" delayMs={300} className="w-full flex justify-center">
            <TopScrollLink
              href={homepage.heroCtaLink || '/categories'}
              className={cn(
                'mt-6 sm:mt-7 md:mt-8 inline-flex items-center justify-center',
                'px-8 sm:px-10 md:px-11 py-3.5 sm:py-4 rounded-full',
                'bg-[#FDFADB]',
                'text-[#BC1D1A]',
                'font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.18em] sm:tracking-[0.2em]',
                'shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:shadow-md',
                'hover:scale-105 active:scale-95 transition-all duration-300 select-none',
              )}
            >
              <span>
                {homepage.heroCtaText ? homepage.heroCtaText.toUpperCase() : 'EXPLORE MENU'}
              </span>
            </TopScrollLink>
          </ScrollReveal>
        </div>
      </ContentContainer>
    </section>
  );
}
