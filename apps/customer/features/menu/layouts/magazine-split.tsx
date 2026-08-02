import * as React from 'react';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Magazine Split Layout
 * One large featured item + remaining items in a side grid.
 * Best for: Falooda, Nuts Shake — high-personality categories.
 */
export function MagazineSplit({ products, themeClasses, animationConfig }: LayoutComponentProps) {
  const [featured, ...rest] = products;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-5 gap-10 md:gap-16">
      {/* Featured large card */}
      {featured && (
        <MotionWrapper config={animationConfig} index={0} className="lg:col-span-3">
          <ProductCard
            product={featured}
            themeClasses={themeClasses}
            presentationStyle="overlay"
            emphasis="featured"
            priority={true}
          />
        </MotionWrapper>
      )}

      {/* Side grid */}
      <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8 content-start">
        {rest.slice(0, 4).map((product, idx) => (
          <MotionWrapper key={product.id} config={animationConfig} index={idx + 1}>
            <ProductCard
              product={product}
              themeClasses={themeClasses}
              presentationStyle="standard"
              emphasis="normal"
              priority={idx < 2}
            />
          </MotionWrapper>
        ))}
      </div>
    </div>
  );
}
