import * as React from 'react';
import { cn, formatBadge } from '@qbm/ui';

export { formatBadge };

interface ProductBadgeProps {
  label?: string | undefined;
  className?: string;
}

/**
 * Product Badge — Server Component
 *
 * Renders an optional badge (e.g. "Signature", "Best Seller") over a product image.
 * If the label is undefined or empty, it renders nothing.
 */
export function ProductBadge({ label, className }: ProductBadgeProps) {
  const displayLabel = formatBadge(label);
  if (!displayLabel) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-3 py-1 rounded-full z-20 shadow-none backdrop-blur-none',
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}
