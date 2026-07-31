import * as React from 'react';
import { cn } from '../../lib/cn';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * Standard error state component.
 * Intended to be shown when an API request fails or an error boundary catches an exception.
 */
const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title = 'Something went wrong', message, onRetry, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center text-destructive animate-in fade-in',
          className
        )}
        {...props}
      >
        <div className="mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          ⚠️
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm max-w-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }
);
ErrorState.displayName = 'ErrorState';

export { ErrorState };
