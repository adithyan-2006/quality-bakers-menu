import * as React from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from '../../components/spinner';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

/**
 * Standard loading state component.
 * Intended to be shown during full-page or section-level data fetching.
 */
const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, title = 'Loading...', description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          'flex flex-col items-center justify-center p-12 text-muted-foreground animate-in fade-in motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        <Spinner size={32} className="mb-4" />
        <h3 className="text-sm font-medium">{title}</h3>
        {description && <p className="mt-2 text-sm max-w-sm text-center">{description}</p>}
      </div>
    );
  }
);
LoadingState.displayName = 'LoadingState';

export { LoadingState };
