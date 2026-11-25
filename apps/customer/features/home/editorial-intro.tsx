import * as React from 'react';
import { cn } from '@qbm/ui';
import { TopScrollLink } from '../../components/top-scroll-link';

import { ScrollReveal } from '../../components/scroll-reveal';
import { ContentContainer } from '../../components/layout/content-container';
import { DrippingAnimation } from './dripping-animation';
import { QualityYouCanTasteMark } from '../../components/brand/quality-you-can-taste-mark';
import { QualityYouCanTasteMobileMark } from '../../components/brand/quality-you-can-taste-mobile-mark';
import { ScrollCue } from '../../components/scroll-cue';
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
      className="hero-viewport-section relative w-full bg-[#BC1D1A] flex flex-col justify-between scroll-mt-[64px] md:scroll-mt-[72px] lg:scroll-mt-[76px] overflow-hidden"
    >
      {/* Living Melted Header Dripping & Natural Splash Animation */}
      <DrippingAnimation />

      {/* Top Banner (Marquee) */}
      <ScrollReveal
        animation="fade-in"
        delayMs={50}
        className="hero-marquee-wrapper w-full z-20 relative mt-3.5 min-[360px]:mt-4 sm:mt-5 md:mt-6 shrink-0"
      >
        <div className="hero-marquee-bar w-full border-b border-[#FDFADB]/15 py-2 min-[360px]:py-2.5 sm:py-3 md:py-3.5 flex items-center overflow-hidden flex-shrink-0 bg-[#BC1D1A]">
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
      </ScrollReveal>

      {/* Main Hero Content - Responsive Layout */}
      <ContentContainer className="hero-content-container relative flex flex-col flex-1 px-4 sm:px-6 md:px-8 pt-2 pb-5 min-[360px]:pt-2 min-[360px]:pb-7 sm:py-6 md:py-8 justify-center min-h-0">
        {/* MOBILE VIEW (< md): Enlarged left-aligned editorial typography filling screen cleanly */}
        <div className="flex md:hidden flex-col items-start text-left w-full max-w-[360px] min-[390px]:max-w-[395px] min-[412px]:max-w-[420px] sm:max-w-[460px] mx-auto px-1 sm:px-2">
          {/* Top Line: quality bakers - since 2020 */}
          <ScrollReveal animation="hero-subtitle" delayMs={120} className="w-full">
            <div className="hero-mobile-subtitle flex items-center gap-2.5 sm:gap-3 w-full mb-2.5 min-[360px]:mb-3 sm:mb-4 select-none min-w-0">
              <span className="text-[#FDFADB]/95 uppercase font-sans text-[10.5px] min-[360px]:text-[11.5px] sm:text-[13px] tracking-[0.16em] min-[360px]:tracking-[0.22em] sm:tracking-[0.25em] font-semibold truncate">
                QUALITY BAKERS - SINCE 2020
              </span>
              <span className="h-[1px] flex-1 min-w-[16px] max-w-[68px] bg-[#FDFADB]/40 shrink-0" />
            </div>
          </ScrollReveal>

          {/* Main Title: Quality \n you \n can taste (Enlarged stacked 3-line display) */}
          <ScrollReveal animation="hero-title" delayMs={280} className="w-full">
            <h1 className="relative flex flex-col items-start w-full my-1 min-[360px]:my-1.5 sm:my-2">
              <span className="sr-only">Quality you can taste</span>
              <QualityYouCanTasteMobileMark className="hero-title-mobile-svg w-full max-w-[295px] min-[360px]:max-w-[348px] min-[390px]:max-w-[376px] min-[412px]:max-w-[396px] sm:max-w-[440px] h-auto text-[#FDFADB] select-none filter drop-shadow-[0_4px_22px_rgba(0,0,0,0.25)]" />
            </h1>
          </ScrollReveal>

          {/* CTA: Explore Menu button (Bold pill CTA) */}
          <ScrollReveal animation="hero-cta" delayMs={480} className="w-full flex justify-start">
            <TopScrollLink
              href={homepage.heroCtaLink || '/categories'}
              className={cn(
                'hero-cta-button mt-5 min-[360px]:mt-6 sm:mt-7 inline-flex items-center justify-center',
                'px-8 min-[360px]:px-9 sm:px-11 py-3.5 min-[360px]:py-4 rounded-full',
                'bg-[#FDFADB]',
                'text-[#BC1D1A]',
                'font-sans font-bold text-[12.5px] min-[360px]:text-[13.5px] sm:text-sm uppercase tracking-[0.2em]',
                'shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:shadow-md',
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
        <div className="hidden md:flex flex-col items-center justify-center text-center relative z-10 w-full max-w-6xl mx-auto px-4">
          {/* Top Line: Quality Bakers - Since 2020 flanked by subtle horizontal rules */}
          <ScrollReveal
            animation="hero-subtitle"
            delayMs={120}
            className="w-full flex justify-center"
          >
            <div className="hero-desktop-subtitle flex items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full max-w-md md:max-w-xl mx-auto mb-3 sm:mb-4 md:mb-5">
              <span className="h-[1px] flex-1 max-w-[60px] sm:max-w-[80px] md:max-w-[110px] bg-[#FDFADB]/35" />
              <span className="text-[#FDFADB]/95 uppercase font-sans text-xs md:text-sm tracking-[0.24em] md:tracking-[0.3em] font-semibold whitespace-nowrap select-none">
                QUALITY BAKERS - SINCE 2020
              </span>
              <span className="h-[1px] flex-1 max-w-[60px] sm:max-w-[80px] md:max-w-[110px] bg-[#FDFADB]/35" />
            </div>
          </ScrollReveal>

          {/* Main Title: Quality you can taste (Display size with ornate flourishes) */}
          <ScrollReveal animation="hero-title" delayMs={280} className="w-full flex justify-center">
            <h1 className="relative flex flex-col items-center justify-center w-full my-1 sm:my-2">
              <span className="sr-only">Quality you can taste</span>
              <QualityYouCanTasteMark className="hero-title-desktop-svg w-[96%] sm:w-[94%] md:w-[90%] max-w-[580px] sm:max-w-[760px] md:max-w-[920px] lg:max-w-[1020px] xl:max-w-[1100px] h-auto text-[#FDFADB] select-none filter drop-shadow-[0_4px_22px_rgba(0,0,0,0.22)]" />
            </h1>
          </ScrollReveal>

          {/* CTA: Explore Menu button */}
          <ScrollReveal animation="hero-cta" delayMs={480} className="w-full flex justify-center">
            <TopScrollLink
              href={homepage.heroCtaLink || '/categories'}
              className={cn(
                'hero-cta-button mt-6 sm:mt-7 md:mt-9 inline-flex items-center justify-center',
                'px-9 sm:px-11 md:px-12 py-3.5 sm:py-4 rounded-full',
                'bg-[#FDFADB]',
                'text-[#BC1D1A]',
                'font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em]',
                'shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:shadow-md',
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

      {/* Bottom Scroll Cue Indicator with clear illuminated text & jump animation */}
      <div className="hero-scroll-cue-wrapper w-full flex justify-center shrink-0 pb-3 min-[360px]:pb-4 sm:pb-5 md:pb-6 z-20 pointer-events-auto">
        <ScrollCue />
      </div>
    </section>
  );
}
