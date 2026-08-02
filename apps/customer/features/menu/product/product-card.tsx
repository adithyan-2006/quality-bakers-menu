import * as React from 'react';
import Link from 'next/link';
import { cn } from '@qbm/ui';
import type { MenuProduct, ThemeClasses } from '../types';
import { ProductImage } from './product-image';
import { ProductBadge } from './product-badge';

export interface ProductCardProps {
  product: MenuProduct;
  themeClasses: ThemeClasses;
  presentationStyle?: 'standard' | 'overlay' | 'side-by-side';
  emphasis?: 'normal' | 'featured' | 'hero';
  aspectRatio?: 'square' | '4/3' | '3/4' | '16/9' | 'wide';
  imagePosition?: 'left' | 'right';
  priority?: boolean;
}

/**
 * Product Card — Server Component
 *
 * The unified presentation primitive for all products across all layouts.
 * Layouts control macro-positioning (grids, spans, order).
 * ProductCard controls micro-presentation (typography, images, HTML semantics).
 */
export function ProductCard({
  product,
  themeClasses,
  presentationStyle = 'standard',
  emphasis = 'normal',
  aspectRatio,
  imagePosition = 'left',
  priority = false,
}: ProductCardProps) {
  // Resolve default aspect ratios if not explicitly provided
  const resolvedAspectRatio =
    aspectRatio ??
    (presentationStyle === 'side-by-side'
      ? 'square'
      : presentationStyle === 'overlay' && emphasis === 'hero'
        ? 'wide'
        : '4/3');

  // Focus ring styles shared across all variants
  const focusClasses =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

  // ─── OVERLAY STYLE ────────────────────────────────────────────────────────
  if (presentationStyle === 'overlay') {
    return (
      <article className="h-full">
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            'group relative flex items-end overflow-hidden w-full h-full rounded-2xl',
            emphasis === 'hero'
              ? 'min-h-[440px] md:min-h-[560px] rounded-3xl'
              : 'min-h-[280px] md:min-h-[360px]',
            themeClasses.cardHover,
            focusClasses,
          )}
        >
          {/* Base Image Layer */}
          <div className="absolute inset-0">
            <ProductImage
              src={product.image}
              alt={product.name}
              aspectRatio={emphasis === 'hero' ? 'wide' : '4/3'}
              priority={priority}
              className="w-full h-full !absolute"
            />
          </div>

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

          <ProductBadge
            label={product.badge}
            className={cn('absolute top-4 left-4', themeClasses.badge)}
          />

          {/* Content Layer */}
          <div
            className={cn(
              'relative z-20 p-6 md:p-8',
              emphasis === 'hero' ? 'max-w-2xl p-8 md:p-12' : '',
            )}
          >
            <h3
              className={cn(
                'font-serif font-bold text-white drop-shadow-xl',
                emphasis === 'hero'
                  ? 'text-3xl md:text-5xl mb-3'
                  : emphasis === 'featured'
                    ? 'text-2xl md:text-3xl mb-2'
                    : 'text-xl md:text-2xl mb-1',
              )}
            >
              {product.name}
            </h3>

            {(emphasis === 'hero' || emphasis === 'featured') && (
              <p
                className={cn(
                  'text-white/80 font-light',
                  emphasis === 'hero' ? 'text-base md:text-lg max-w-lg' : 'text-sm line-clamp-2',
                )}
              >
                {product.description}
              </p>
            )}

            {product.price && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <span className="text-white/90 font-medium text-sm md:text-base">
                  {product.price}
                </span>
              </div>
            )}
          </div>
        </Link>
      </article>
    );
  }

  // ─── SIDE-BY-SIDE STYLE ───────────────────────────────────────────────────
  if (presentationStyle === 'side-by-side') {
    return (
      <article>
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            'group grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center overflow-hidden rounded-2xl',
            themeClasses.card,
            themeClasses.cardHover,
            'p-4 md:p-6',
            focusClasses,
          )}
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-xl',
              imagePosition === 'right' ? 'md:order-last' : '',
            )}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              aspectRatio={resolvedAspectRatio}
              priority={priority}
            />
            <ProductBadge
              label={product.badge}
              className={cn('absolute top-3 left-3', themeClasses.badge)}
            />
          </div>

          <div
            className={cn('flex flex-col gap-3', imagePosition === 'right' ? 'md:order-first' : '')}
          >
            <h3 className={cn('font-serif font-semibold text-lg md:text-xl', themeClasses.heading)}>
              {product.name}
            </h3>
            <p
              className={cn(
                'text-sm md:text-base leading-relaxed line-clamp-2',
                themeClasses.description,
              )}
            >
              {product.description}
            </p>

            {product.price && (
              <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5">
                <span className={cn('font-semibold text-sm md:text-base', themeClasses.price)}>
                  {product.price}
                </span>
              </div>
            )}
          </div>
        </Link>
      </article>
    );
  }

  // ─── STANDARD STYLE ───────────────────────────────────────────────────────
  return (
    <article className="h-full">
      <Link
        href={`/products/${product.slug}`}
        className={cn(
          'group flex flex-col h-full overflow-hidden rounded-2xl',
          themeClasses.card,
          themeClasses.cardHover,
          focusClasses,
        )}
      >
        <div className="relative rounded-t-2xl overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            aspectRatio={resolvedAspectRatio}
            priority={priority}
          />
          <ProductBadge
            label={product.badge}
            className={cn('absolute top-3 left-3', themeClasses.badge)}
          />
        </div>

        <div className="flex flex-col flex-1 gap-2 p-5 md:p-6">
          <h3 className={cn('leading-snug text-base font-semibold', themeClasses.heading)}>
            {product.name}
          </h3>
          <p
            className={cn(
              'line-clamp-2 text-sm md:text-base leading-relaxed',
              themeClasses.description,
            )}
          >
            {product.description}
          </p>

          {product.price && (
            <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5">
              <span className={cn('font-semibold text-sm md:text-base', themeClasses.price)}>
                {product.price}
              </span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
