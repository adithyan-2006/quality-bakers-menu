import * as React from 'react';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Single-Column Stack Layout
 *
 * Renders product cards vertically in a single column:
 * - Exactly ONE complete product card per row
 * - Next card appears directly below previous card
 * - Centered single-column stack with constrained max-width on tablet/desktop
 * - Comfortable left/right padding on mobile (~16-20px via ContentContainer)
 * - Consistent vertical spacing without decorative separator lines
 */
export function SingleColumnStack({
  products,
  themeClasses,
  animationConfig,
}: LayoutComponentProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 items-center w-full max-w-[480px] sm:max-w-[520px] md:max-w-[560px] mx-auto">
      {products.map((product, idx) => (
        <MotionWrapper key={product.id} config={animationConfig} index={idx} className="w-full">
          <ProductCard
            product={product}
            themeClasses={themeClasses}
            presentationStyle="standard"
            aspectRatio="16/10"
            priority={idx < 2}
          />
        </MotionWrapper>
      ))}
    </div>
  );
}
