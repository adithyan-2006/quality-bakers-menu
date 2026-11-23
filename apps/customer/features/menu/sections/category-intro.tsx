import * as React from 'react';
import { cn } from '@qbm/ui';
import type { MenuCategoryConfig, ThemeClasses, AnimationConfig } from '../types';
import { MotionWrapper } from '../animations/motion-wrapper';

interface CategoryIntroProps {
  config: MenuCategoryConfig;
  themeClasses: ThemeClasses;
  animationConfig: AnimationConfig;
}

/**
 * Category Intro — Server Component
 *
 * Renders the editorial header block for a category.
 * Typography, spacing, and accent are driven purely by themeClasses.
 * The animation is resolved from the category's animationPreset.
 */
export function CategoryIntro({ config, themeClasses, animationConfig }: CategoryIntroProps) {
  return (
    <div className="mb-6 sm:mb-8 md:mb-12">
      <MotionWrapper config={animationConfig} index={0} variant="heading">
        <div className="flex items-center gap-4 mb-3 md:mb-4">
          {/* Decorative accent line */}
          <div className="h-px flex-1 max-w-[80px] border-brand-cream/20 border-t" />
          <span className={cn(themeClasses.subheading, 'tracking-[0.2em]')}>MENU</span>
        </div>
      </MotionWrapper>

      <MotionWrapper config={animationConfig} index={1} variant="heading">
        <h2
          id={`category-${config.slug}`}
          className={cn(
            'font-bold leading-[1.1] font-serif tracking-tight text-4xl min-[380px]:text-5xl md:text-7xl lg:text-8xl mb-4 md:mb-6',
            themeClasses.heading,
          )}
        >
          {config.name}
        </h2>
      </MotionWrapper>

      <MotionWrapper config={animationConfig} index={2} variant="description" delayMs={120}>
        <p
          className={cn(
            'max-w-2xl font-sans leading-relaxed text-base sm:text-lg md:text-xl lg:text-2xl',
            themeClasses.description,
          )}
        >
          {config.description}
        </p>
      </MotionWrapper>
    </div>
  );
}
