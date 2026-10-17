import * as React from 'react';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Spotlight Layout
 * One hero product taking dominant visual space, minimal secondary items.
 * Best for: Falooda, signature items — premium presentation.
 */
export function Spotlight({ products, themeClasses, animationConfig }: LayoutComponentProps) {
  const [hero, ...rest] = products;

  return (
    <div className="flex flex-col gap-10 sm:gap-16 md:gap-24">
      {/* Hero */}
      {hero && (
        <MotionWrapper config={animationConfig} index={0}>
          <ProductCard
            product={hero}
            themeClasses={themeClasses}
            presentationStyle="overlay"
            emphasis="hero"
            priority={true}
          />
        </MotionWrapper>
      )}

      {/* Secondary items */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {rest.map((product, idx) => (
            <MotionWrapper
              key={product.id}
              config={animationConfig}
              index={idx + 1}
              className="w-full"
            >
              <ProductCard
                product={product}
                themeClasses={themeClasses}
                presentationStyle="standard"
                emphasis="normal"
                priority={false}
              />
            </MotionWrapper>
          ))}
        </div>
      )}
    </div>
  );
}
