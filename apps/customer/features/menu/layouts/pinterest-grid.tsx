import { cn } from '@qbm/ui';
import type { LayoutComponentProps } from '../engines/layout-engine';
import { ProductCard } from '../product/product-card';
import { MotionWrapper } from '../animations/motion-wrapper';

/**
 * Pinterest Grid Layout
 * Masonry-like two-column grid on tablet/desktop, clean single-column on mobile.
 * Best for: image-rich categories, smoothies, juices.
 */
export function PinterestGrid({ products, themeClasses, animationConfig }: LayoutComponentProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 items-start">
      {products.map((product, idx) => {
        const isOdd = idx % 2 === 1;
        return (
          <MotionWrapper
            key={product.id}
            config={animationConfig}
            index={idx}
            className={cn('w-full', isOdd && 'sm:mt-8 md:mt-12')}
          >
            <ProductCard
              product={product}
              themeClasses={themeClasses}
              presentationStyle="standard"
              aspectRatio={idx % 2 === 0 ? '3/4' : 'square'}
              priority={idx < 2}
            />
          </MotionWrapper>
        );
      })}
    </div>
  );
}
