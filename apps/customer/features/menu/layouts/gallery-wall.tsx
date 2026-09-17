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
            <div className="h-full w-full">
              <ProductCard
                product={product}
                themeClasses={themeClasses}
                presentationStyle={isHero ? 'gallery-featured' : 'gallery-standard'}
                emphasis={isHero ? 'featured' : 'normal'}
                aspectRatio={isHero ? 'wide' : '4/3'}
                priority={idx < 4}
              />
            </div>
          </MotionWrapper>
        );
      })}
    </div>
  );
}
