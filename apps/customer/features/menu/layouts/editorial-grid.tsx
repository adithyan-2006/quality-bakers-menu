import * as React from 'react';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Editorial Grid Layout
 * Classic 2–3 column grid. Editorial feel with generous gaps.
 * Best for: standard categories.
 */
export function EditorialGrid({ products, themeClasses, animationConfig }: LayoutComponentProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 justify-items-center">
      {products.map((product, idx) => (
        <MotionWrapper
          key={product.id}
          config={animationConfig}
          index={idx}
          className="w-full flex justify-center"
        >
          <ProductCard
            product={product}
            themeClasses={themeClasses}
            presentationStyle="standard"
            aspectRatio="16/10"
            priority={idx < 2} // Optimizes LCP for the first row
          />
        </MotionWrapper>
      ))}
    </div>
  );
}
