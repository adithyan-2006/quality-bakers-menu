import * as React from 'react';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Alternating Layout
 * Products alternate between image-left and image-right compositions.
 * Magazine editorial feel. Best for: tea, coffee — narrative categories.
 */
export function AlternatingLayout({
  products,
  themeClasses,
  animationConfig,
}: LayoutComponentProps) {
  return (
    <div className="flex flex-col gap-16 md:gap-32">
      {products.map((product, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <MotionWrapper key={product.id} config={animationConfig} index={idx}>
            <ProductCard
              product={product}
              themeClasses={themeClasses}
              presentationStyle="side-by-side"
              emphasis="featured"
              aspectRatio="16/10"
              imagePosition={isEven ? 'left' : 'right'}
              priority={idx < 2}
            />
          </MotionWrapper>
        );
      })}
    </div>
  );
}
