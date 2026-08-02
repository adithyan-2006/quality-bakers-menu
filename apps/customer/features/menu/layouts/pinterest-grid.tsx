import * as React from 'react';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Pinterest Grid Layout
 * Masonry-like two-column grid with alternating card heights.
 * Best for: image-rich categories, smoothies, juices.
 */
export function PinterestGrid({ products, themeClasses, animationConfig }: LayoutComponentProps) {
  const left = products.filter((_, i) => i % 2 === 0);
  const right = products.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-2 gap-6 md:gap-8 items-start">
      {/* Left column — starts higher */}
      <div className="flex flex-col gap-10 md:gap-12">
        {left.map((product, idx) => (
          <MotionWrapper key={product.id} config={animationConfig} index={idx * 2}>
            <ProductCard
              product={product}
              themeClasses={themeClasses}
              presentationStyle="standard"
              aspectRatio={idx % 2 === 0 ? '3/4' : 'square'}
              priority={idx === 0}
            />
          </MotionWrapper>
        ))}
      </div>
      {/* Right column — offset via padding */}
      <div className="flex flex-col gap-10 md:gap-12 mt-12 md:mt-24">
        {right.map((product, idx) => (
          <MotionWrapper key={product.id} config={animationConfig} index={idx * 2 + 1}>
            <ProductCard
              product={product}
              themeClasses={themeClasses}
              presentationStyle="standard"
              aspectRatio={idx % 2 === 0 ? 'square' : '3/4'}
              priority={idx === 0}
            />
          </MotionWrapper>
        ))}
      </div>
    </div>
  );
}
