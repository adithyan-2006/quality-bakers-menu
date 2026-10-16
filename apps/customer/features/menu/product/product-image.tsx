import * as React from 'react';
import Image from 'next/image';
import { cn } from '@qbm/ui';

interface ProductImageProps {
  src?: string | undefined;
  alt: string;
  aspectRatio?: 'square' | '4/3' | '3/4' | '16/9' | '16/10' | 'wide';
  priority?: boolean;
  className?: string;
  /** Zoom effect on parent group hover */
  zoom?: boolean;
}

/**
 * Product Image — Server Component
 *
 * The single source of truth for all product image rendering.
 * Every layout that shows a product image uses this component.
 *
 * Responsibilities:
 * - Renders next/image when src is present (optimized, responsive)
 * - Renders an animated shimmer placeholder when src is absent
 * - Handles loading state with a shimmer skeleton
 * - Applies zoom on group-hover
 *
 * Cloudinary integration:
 *   When Cloudinary is connected, pass the Cloudinary URL as `src`.
 *   The component does not need to change — next/image handles optimization.
 *   Configure the Cloudinary domain in next.config.ts under images.domains.
 *
 * Aspect ratio tokens:
 *   square    → 1:1    — small secondary cards
 *   4/3       → 4:3    — standard product card
 *   3/4       → 3:4    — portrait / Pinterest cards
 *   16/9      → 16:9   — wide feature cards
 *   16/10     → 16:10  — single column editorial stack cards
 *   wide      → 7:3    — cinematic hero cards
 */
const ASPECT_CLASSES: Record<NonNullable<ProductImageProps['aspectRatio']>, string> = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '16/9': 'aspect-video',
  '16/10': 'aspect-[16/10]',
  wide: 'aspect-[7/3]',
};

export function ProductImage({
  src,
  alt,
  aspectRatio = '4/3',
  priority = false,
  className,
  zoom = true,
}: ProductImageProps) {
  const aspectClass = ASPECT_CLASSES[aspectRatio];

  return (
    <div className={cn('relative overflow-hidden bg-muted', aspectClass, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            'object-cover transition-transform duration-700 ease-out',
            zoom && 'group-hover:scale-[1.04]',
          )}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY0Ii8+PC9zdmc+"
        />
      ) : (
        // Premium placeholder: muted base with grain texture shimmer
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60',
            zoom && 'transition-transform duration-700 ease-out group-hover:scale-[1.04]',
          )}
          aria-hidden="true"
        >
          {/* Animated shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
          {/* Subtle food photography stand-in pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-foreground via-transparent to-transparent" />
        </div>
      )}
    </div>
  );
}
