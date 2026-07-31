import * as React from 'react';
import { cn } from '../../lib/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Indeterminate loading spinner.
 * Intended to be used within buttons, empty states, or full-page overlays.
 * Respects prefers-reduced-motion.
 */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 24, 'aria-label': ariaLabel = 'Loading', ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        width={size}
        height={size}
        role="status"
        aria-label={ariaLabel}
        className={cn('animate-spin text-muted-foreground motion-reduce:animate-none', className)}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };
