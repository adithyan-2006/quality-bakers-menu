import * as React from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full';
  animation?: 'pulse' | 'none';
}

/**
 * Loading skeleton placeholder.
 * Intended to be composed together to represent loading content structure.
 * Respects prefers-reduced-motion.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animation = 'pulse', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading placeholder"
        className={cn(
          'rounded-md bg-muted',
          animation === 'pulse' && 'animate-pulse motion-reduce:animate-none',
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
