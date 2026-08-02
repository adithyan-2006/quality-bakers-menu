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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
      {products.map((product, idx) => (
        <MotionWrapper key={product.id} config={animationConfig} index={idx}>
          <ProductCard
            product={product}
            themeClasses={themeClasses}
            presentationStyle="standard"
            aspectRatio="4/3"
            priority={idx < 2} // Optimizes LCP for the first row
          />
        </MotionWrapper>
      ))}
    </div>
  );
}
