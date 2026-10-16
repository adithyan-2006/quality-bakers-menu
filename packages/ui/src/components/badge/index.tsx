import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * Badge component for displaying status or categories.
 * Intended to be used in lists or cards to highlight specific attributes.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * Formats a badge identifier into a clean display label without underscores or hyphens.
 * E.g., 'BEST_SELLER' -> 'Best Seller', 'CHEFS_CHOICE' -> "Chef's Choice", 'best-seller' -> 'Best Seller'
 */
export function formatBadge(badge?: string | null): string | undefined {
  if (!badge) return undefined;
  const trimmed = badge.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NONE') return undefined;

  const KNOWN_BADGES: Record<string, string> = {
    SIGNATURE: 'Signature',
    BEST_SELLER: 'Best Seller',
    NEW: 'New',
    SEASONAL: 'Seasonal',
    CHEFS_CHOICE: "Chef's Choice",
  };

  const normalizedKey = trimmed.toUpperCase().replace(/[-\s]+/g, '_');
  if (KNOWN_BADGES[normalizedKey]) {
    return KNOWN_BADGES[normalizedKey];
  }

  return trimmed
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export { Badge, badgeVariants };
