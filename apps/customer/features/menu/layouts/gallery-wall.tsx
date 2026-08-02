import * as React from 'react';
import { cn } from '@qbm/ui';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Gallery Wall Layout
 * Variable-sized tiles in an asymmetric pattern. Visually rich.
 * Best for: image-forward categories — Ice Cream Shake, Fruit Salad.
 */
export function GalleryWall({ products, themeClasses, animationConfig }: LayoutComponentProps) {
  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {products.map((product, idx) => {
        // Mobile pattern
        const isHero = idx === 0;

        return (
          <MotionWrapper
            key={product.id}
            config={animationConfig}
            index={idx}
            className={cn(
              // Mobile alignment
              'w-full',
              // Desktop grid span: Hero takes full width
              isHero ? 'md:col-span-full' : '',
            )}
          >
            {/* Mobile Card */}
            <div
              className={cn(
                'block md:hidden h-full w-full',
                !isHero && '[&_a]:!grid-cols-[40%_1fr] [&_a]:!gap-4 [&_a]:!p-3 [&_a]:!items-center',
              )}
            >
              <ProductCard
                product={product}
                themeClasses={themeClasses}
                // Hero stays overlay, everything else becomes cafe list (side-by-side)
                presentationStyle={isHero ? 'overlay' : 'side-by-side'}
                emphasis={isHero ? 'featured' : 'normal'}
                aspectRatio={isHero ? '4/3' : 'square'}
                priority={idx < 4}
              />
            </div>

            {/* Desktop Card */}
            <div className="hidden md:block h-full w-full">
              <ProductCard
                product={product}
                themeClasses={themeClasses}
                presentationStyle={isHero ? 'overlay' : 'standard'}
                emphasis={isHero ? 'featured' : 'normal'}
                aspectRatio={isHero ? 'wide' : 'square'}
                priority={idx < 4}
              />
            </div>
          </MotionWrapper>
        );
      })}
    </div>
  );
}
