import * as React from 'react';
import { cn } from '@qbm/ui';
import type { MenuProduct, ThemeClasses } from '../types';
import { ProductImage } from './product-image';
import { LikeButton } from './like-button';

export interface ProductCardProps {
  product: MenuProduct;
  themeClasses: ThemeClasses;
  presentationStyle?:
    | 'standard'
    | 'overlay'
    | 'side-by-side'
    | 'gallery-featured'
    | 'gallery-standard'
    | 'signature-standard';
  emphasis?: 'normal' | 'featured' | 'hero';
  aspectRatio?: 'square' | '4/3' | '3/4' | '16/9' | '16/10' | 'wide';
  imagePosition?: 'left' | 'right';
  priority?: boolean;
}

export function formatCurrencyPrice(price?: string | null): string | null {
  if (!price) return null;
  const trimmed = price.trim();
  if (trimmed.startsWith('₹')) return trimmed;
  if (/^Rs\.?\s*/i.test(trimmed)) {
    return `₹${trimmed.replace(/^Rs\.?\s*/i, '')}`;
  }
  return `₹${trimmed}`;
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
  const formattedPrice = formatCurrencyPrice(product.price);

  // Resolve default aspect ratios if not explicitly provided
  const resolvedAspectRatio =
    aspectRatio ??
    (presentationStyle === 'side-by-side'
      ? 'square'
      : presentationStyle === 'overlay' && emphasis === 'hero'
        ? 'wide'
        : '16/10');

  // Focus ring styles shared across all variants
  const focusClasses =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

  // ─── GALLERY FEATURED STYLE (HORIZONTAL EDITORIAL) ────────────────────────
  if (presentationStyle === 'gallery-featured') {
    return (
      <article className="h-full">
        <div
          className={cn(
            'group flex flex-col md:flex-row items-stretch h-full rounded-2xl overflow-hidden p-4 md:p-6 gap-6 md:gap-8',
            themeClasses.card,
            themeClasses.cardHover,
            focusClasses,
          )}
        >
          {/* Large Image Block */}
          <div className="relative w-full md:w-1/2 lg:w-[55%] min-h-[300px] md:min-h-[400px] rounded-xl overflow-hidden border border-black/5 shadow-inner flex-shrink-0">
            <ProductImage
              src={product.image}
              alt={product.name}
              aspectRatio="wide"
              priority={priority}
              className="w-full h-full !absolute inset-0 object-cover"
            />
            {/* Badge Over Image */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-10 rounded-full border border-brand-brick-red bg-transparent px-3 py-1">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-brand-brick-red font-bold">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col flex-1 justify-center relative">
            <div className="flex flex-col max-w-[85%] md:max-w-none pt-4 md:pt-6">
              <h3 className="font-serif font-bold text-3xl md:text-4xl lg:text-5xl text-[#BC1D1A] leading-[1.1] group-hover:text-brand-brick-red transition-colors duration-300">
                {product.name}
              </h3>

              <div className="w-full border-t border-black/20 my-4 md:my-6" />

              {product.description && (
                <p className="text-base md:text-lg leading-relaxed text-[#BC1D1A]/80">
                  {product.description}
                </p>
              )}

              <div className="mt-6 pt-4 border-t border-black/20 flex items-center justify-between">
                {formattedPrice && (
                  <span className="font-bold font-sans tracking-wide text-sm md:text-base text-brand-dark">
                    {formattedPrice}
                  </span>
                )}
                <LikeButton
                  productId={product.id}
                  productName={product.name}
                  initialGlobalCount={product.likeCount}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─── GALLERY STANDARD STYLE ───────────────────────────────────────────────
  if (presentationStyle === 'gallery-standard') {
    return (
      <article className="h-full">
        <div
          className={cn(
            'group flex flex-col h-full rounded-2xl overflow-hidden p-4 md:p-5 gap-4',
            themeClasses.card,
            themeClasses.cardHover,
            focusClasses,
          )}
        >
          {/* Image Block */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-black/5 shadow-inner">
            <ProductImage
              src={product.image}
              alt={product.name}
              aspectRatio="4/3"
              priority={priority}
              className="w-full h-full !absolute inset-0 object-cover"
            />
            {/* Badge Over Image */}
            {product.badge && (
              <div className="absolute top-3 left-3 z-10 rounded-full border border-brand-brick-red bg-transparent px-3 py-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-brand-brick-red font-bold">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Text Block */}
          <div className="flex flex-col flex-1 relative mt-2">
            <h3 className="font-serif font-bold text-xl md:text-2xl text-[#BC1D1A] leading-tight group-hover:text-brand-brick-red transition-colors duration-300">
              {product.name}
            </h3>

            <div className="w-full border-t border-black/20 my-3" />

            {product.description && (
              <p className="text-sm md:text-base leading-relaxed text-[#BC1D1A]/80 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="mt-auto pt-3 border-t border-black/15 flex items-center justify-between">
              {formattedPrice && (
                <span className="font-bold font-sans tracking-wide text-sm text-brand-dark">
                  {formattedPrice}
                </span>
              )}
              <LikeButton
                productId={product.id}
                productName={product.name}
                initialGlobalCount={product.likeCount}
              />
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─── SIGNATURE STANDARD STYLE ───────────────────────────────────────────────
  if (presentationStyle === 'signature-standard') {
    return (
      <article className="h-full">
        <div
          className={cn(
            'group flex flex-col h-full rounded-2xl overflow-hidden p-3 md:p-4',
            themeClasses.card,
            themeClasses.cardHover,
            focusClasses,
          )}
        >
          {/* Image Block — no badge for Signature showcase */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-black/5 shadow-inner flex-shrink-0">
            <ProductImage
              src={product.image}
              alt={product.name}
              aspectRatio="4/3"
              priority={priority}
              className="w-full h-full !absolute inset-0 object-cover"
            />
          </div>

          {/* Text Block — natural flow, price anchored after description */}
          <div className="flex flex-col pt-3 pb-1 px-1 gap-2">
            <h3
              className={cn(
                'font-serif font-bold text-xl md:text-2xl leading-tight group-hover:text-brand-brick-red transition-colors duration-300',
                themeClasses.heading || 'text-[#BC1D1A]',
              )}
            >
              {product.name}
            </h3>

            <div className="w-full border-t border-black/15" />

            {product.description && (
              <p
                className={cn(
                  'text-sm md:text-base leading-relaxed line-clamp-3',
                  themeClasses.description || 'text-[#BC1D1A]/80',
                )}
              >
                {product.description}
              </p>
            )}

            {/* Price — immediately after description, no large gap */}
            {formattedPrice && (
              <div className="pt-1 flex items-center justify-between">
                <span className="font-bold font-sans tracking-wide text-base text-brand-dark">
                  {formattedPrice}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  // ─── OVERLAY STYLE (REDESIGNED AS PREMIUM CREAM CARD) ──────────────────────
  if (presentationStyle === 'overlay') {
    return (
      <article className="h-full">
        <div
          className={cn(
            'group flex flex-col h-full rounded-2xl overflow-hidden',
            themeClasses.card,
            themeClasses.cardHover,
            focusClasses,
          )}
        >
          {/* Editorial Header */}
          <div className="flex justify-between items-start mb-0 p-5 md:p-8 pb-0">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-brand-brick-red font-bold">
              {product.badge || 'Featured Signature'}
            </span>
            {formattedPrice && (
              <span className="font-bold font-sans tracking-wide text-sm md:text-base text-brand-dark">
                {formattedPrice}
              </span>
            )}
          </div>

          {/* Asymmetric Content Block */}
          <div className="flex flex-col md:flex-row flex-1 items-stretch p-5 md:p-8 pt-4 md:gap-10">
            {/* Massive Imagery */}
            <div className="relative flex-1 w-full min-h-[300px] md:min-h-[400px] rounded-xl overflow-hidden bg-brand-deep-cream border border-black/5 shadow-inner">
              <ProductImage
                src={product.image}
                alt={product.name}
                aspectRatio="4/3"
                priority={priority}
                className="w-full h-full !absolute inset-0 object-cover"
              />
            </div>

            {/* Integrated Text Block */}
            <div className="flex flex-col justify-end md:w-2/5 xl:w-1/3 pb-2 pt-6 md:pt-0">
              <h3 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl mb-4 text-[#BC1D1A] leading-[1.05] group-hover:text-brand-brick-red transition-colors duration-300">
                {product.name}
              </h3>
              {(emphasis === 'hero' || emphasis === 'featured') && product.description && (
                <div className="pt-6 border-t border-black/20 mt-2">
                  <p className="text-base md:text-lg leading-relaxed text-[#BC1D1A]/70">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-black/20 flex items-center justify-between">
                {formattedPrice && (
                  <span className="font-bold font-sans tracking-wide text-sm md:text-base text-brand-dark">
                    {formattedPrice}
                  </span>
                )}
                <LikeButton
                  productId={product.id}
                  productName={product.name}
                  initialGlobalCount={product.likeCount}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─── SIDE-BY-SIDE STYLE ───────────────────────────────────────────────────
  if (presentationStyle === 'side-by-side') {
    return (
      <article>
        <div
          className={cn(
            'group grid grid-cols-1 md:grid-cols-2 items-center rounded-2xl overflow-hidden',
            themeClasses.card,
            themeClasses.cardHover,
            focusClasses,
          )}
        >
          <div
            className={cn(
              'relative overflow-hidden bg-brand-deep-cream border-r border-black/5 h-full',
              imagePosition === 'right' ? 'md:order-last border-r-0 border-l' : '',
            )}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              aspectRatio={resolvedAspectRatio}
              priority={priority}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-brand-warm-cream/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm z-10">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-brand-brick-red font-bold">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          <div
            className={cn(
              'flex flex-col gap-3 p-5 md:p-8 flex-1 justify-between',
              imagePosition === 'right' ? 'md:order-first' : '',
            )}
          >
            <div>
              <h3 className="font-serif font-bold text-3xl mb-1 text-[#BC1D1A] group-hover:text-brand-brick-red transition-colors duration-300">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm md:text-base leading-relaxed text-[#BC1D1A]/70 mb-2">
                  {product.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-black/20 flex items-center justify-between">
              {formattedPrice && (
                <span className="font-bold font-sans tracking-wide text-sm md:text-base text-brand-dark">
                  {formattedPrice}
                </span>
              )}
              <LikeButton
                productId={product.id}
                productName={product.name}
                initialGlobalCount={product.likeCount}
              />
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─── STANDARD STYLE ───────────────────────────────────────────────────────
  return (
    <article className="w-full h-full">
      <div
        className={cn(
          'group flex flex-col w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden',
          themeClasses.card,
          themeClasses.cardHover,
          focusClasses,
        )}
      >
        <div className="relative overflow-hidden bg-brand-deep-cream">
          <ProductImage
            src={product.image}
            alt={product.name}
            aspectRatio={resolvedAspectRatio}
            priority={priority}
          />
          {product.badge && (
            <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 bg-[#FDFADB] px-3.5 py-1 rounded-full shadow-sm z-10">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-[#BC1D1A] font-bold">
                {product.badge}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-4 sm:p-5 md:p-6 bg-[#FDFADB]">
          <h3 className="leading-tight text-[22px] sm:text-2xl md:text-[26px] font-serif font-bold mb-1 sm:mb-1.5 text-[#BC1D1A] group-hover:text-brand-brick-red transition-colors duration-300">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 text-base sm:text-[17px] md:text-lg font-sans leading-relaxed text-[#BC1D1A]/70 mb-3 sm:mb-4">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-2.5 sm:pt-3 border-t border-black/10 flex items-center justify-between">
            {formattedPrice && (
              <span className="font-bold font-sans tracking-wide text-base sm:text-lg text-brand-dark">
                {formattedPrice}
              </span>
            )}
            <LikeButton
              productId={product.id}
              productName={product.name}
              initialGlobalCount={product.likeCount}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
