import * as React from 'react';
import { cn } from '../../lib/cn';

export type PolymorphicProps<E extends React.ElementType, P> = P &
  Omit<React.ComponentPropsWithoutRef<E>, keyof P> & {
    as?: E;
  };

/**
 * Page boundary container.
 * Intended to restrict maximum width and center content on large screens.
 */
export const Container = React.forwardRef(
  <E extends React.ElementType = 'div'>(
    { as, className, ...props }: PolymorphicProps<E, {}>,
    ref: React.ComponentPropsWithRef<E>['ref']
  ) => {
    const Component = as || 'div';
    return (
      <Component
        ref={ref}
        className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
        {...props}
      />
    );
  }
) as <E extends React.ElementType = 'div'>(
  props: PolymorphicProps<E, {}> & { ref?: React.ComponentPropsWithRef<E>['ref'] }
) => React.ReactElement | null;

(Container as any).displayName = 'Container';
