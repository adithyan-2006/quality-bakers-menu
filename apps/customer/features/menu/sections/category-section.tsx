import * as React from 'react';
import { cn } from '@qbm/ui';
import type { MenuCategoryConfig, MenuProduct } from '../types';
import { resolveTheme } from '../engines/theme-engine';
import { resolveAnimation } from '../engines/animation-engine';
import { CategoryIntro } from './category-intro';
import { LayoutEngine } from '../engines/layout-engine';
import { ContentContainer } from '../../../components/layout/content-container';

interface CategorySectionProps {
  config: MenuCategoryConfig;
  products: MenuProduct[];
}

/**
 * Category Section — Server Component
 *
 * Top-level orchestrator for a single category block.
 * Resolves theme + animation, then delegates to:
 *   - CategoryIntro (editorial header)
 *   - LayoutEngine (product grid dispatcher)
 *
 * Has no layout or animation logic itself.
 * Is the only component that knows the full MenuCategoryConfig.
 *
 * The section ID matches the slug for CategoryNav deep-linking.
 */
export function CategorySection({ config, products }: CategorySectionProps) {
  // Animation resolved exactly once here — passed as prop to children.
  const animationConfig = resolveAnimation(config.animationPreset);

  // ThemeEngine returns only ThemeClasses — clean contract preserved.
  const themeClasses = resolveTheme(config.displayStyle);

  const sectionStyle = config.accentColor
    ? ({ '--accent-color': config.accentColor } as React.CSSProperties)
    : undefined;

  // Infer pacing level from layout type
  const pacing =
    config.layoutType === 'spotlight' || config.layoutType === 'magazine-split'
      ? 'hero'
      : config.layoutType === 'pinterest-grid' || config.layoutType === 'gallery-wall'
        ? 'compact'
        : 'standard';

  return (
    <section
      id={config.slug}
      aria-labelledby={`category-${config.slug}`}
      className={cn(
        'relative',
        pacing === 'hero'
          ? 'py-24 md:py-32 lg:py-40'
          : pacing === 'compact'
            ? 'py-12 md:py-16'
            : 'py-16 md:py-24', // standard
        themeClasses.section,
      )}
      style={sectionStyle}
    >
      <ContentContainer>
        <CategoryIntro
          config={config}
          themeClasses={themeClasses}
          animationConfig={animationConfig}
        />

        {products.length > 0 ? (
          <LayoutEngine
            layoutType={config.layoutType}
            products={products}
            themeClasses={themeClasses}
            animationConfig={animationConfig}
          />
        ) : (
          <div className={cn('py-16 text-center text-sm', themeClasses.description)}>
            Products coming soon.
          </div>
        )}
      </ContentContainer>

      {/* Subtle Category Closing / Breathing Room */}
      <div
        className={cn(
          'mx-auto h-px bg-gradient-to-r from-transparent via-border to-transparent',
          pacing === 'hero'
            ? 'mt-24 md:mt-32 w-32 md:w-48 opacity-100'
            : pacing === 'compact'
              ? 'mt-12 md:mt-16 w-16 opacity-50'
              : 'mt-16 md:mt-24 w-24 opacity-80', // standard
        )}
      />
    </section>
  );
}
