import * as React from 'react';
import { cn } from '../../lib/cn';

export interface StackOwnProps {
  direction?: 'row' | 'col';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export type PolymorphicStackProps<E extends React.ElementType> = StackOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof StackOwnProps> & {
    as?: E;
  };

const spacingMap = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

/**
 * Flexbox stack primitive.
 * Intended for quickly laying out elements vertically or horizontally with consistent spacing.
 */
export const Stack = React.forwardRef(
  ({ as, className, direction = 'col', spacing = 'md', wrap = false, ...props }: any, ref: any) => {
    const Component = as || 'div';
    return (
      <Component
        ref={ref}
        className={cn(
          'flex',
          direction === 'col' ? 'flex-col' : 'flex-row items-center',
          wrap && 'flex-wrap',
          spacingMap[spacing as keyof typeof spacingMap],
          className,
        )}
        {...props}
      />
    );
  },
) as <E extends React.ElementType = 'div'>(
  props: PolymorphicStackProps<E> & { ref?: React.ComponentPropsWithRef<E>['ref'] },
) => React.ReactElement | null;

(Stack as any).displayName = 'Stack';
