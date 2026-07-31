import * as React from 'react';
import { cn } from '../../lib/cn';

export interface GridOwnProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
}

export type PolymorphicGridProps<E extends React.ElementType> = GridOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof GridOwnProps> & {
    as?: E;
  };

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
  12: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-12',
};

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

/**
 * Responsive CSS Grid primitive.
 * Intended for product catalogs, forms, and dashboard layouts.
 */
export const Grid = React.forwardRef(
  <E extends React.ElementType = 'div'>(
    { as, className, cols = 1, gap = 'md', ...props }: PolymorphicGridProps<E>,
    ref: React.ComponentPropsWithRef<E>['ref']
  ) => {
    const Component = as || 'div';
    return (
      <Component
        ref={ref}
        className={cn('grid', colsMap[cols], gapMap[gap], className)}
        {...props}
      />
    );
  }
) as <E extends React.ElementType = 'div'>(
  props: PolymorphicGridProps<E> & { ref?: React.ComponentPropsWithRef<E>['ref'] }
) => React.ReactElement | null;

(Grid as any).displayName = 'Grid';
