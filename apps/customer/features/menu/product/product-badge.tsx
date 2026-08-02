import * as React from 'react';
import { cn } from '@qbm/ui';

interface ProductBadgeProps {
  label?: string | undefined;
  className?: string;
}

/**
 * Product Badge — Server Component
 *
 * Renders an optional badge (e.g. "Signature", "Popular") over a product image.
 * If the label is undefined or empty, it renders nothing.
 */
export function ProductBadge({ label, className }: ProductBadgeProps) {
  if (!label) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-3 py-1 rounded-full z-20 shadow-none backdrop-blur-none',
        className,
      )}
    >
      {label}
    </span>
  );
}
