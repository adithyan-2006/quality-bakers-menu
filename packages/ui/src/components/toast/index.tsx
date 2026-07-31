import * as React from 'react';
import { cn } from '../../lib/cn';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success';
  title?: string;
  description?: string;
  onClose?: () => void;
}

/**
 * Toast notification primitive.
 * Intended to be managed by a global ToastProvider for non-blocking alerts.
 */
const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', title, description, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'pointer-events-auto flex w-full max-w-md flex-col gap-1 rounded-md border p-4 shadow-lg transition-all',
          variant === 'default' && 'bg-background text-foreground',
          variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground',
          variant === 'success' && 'border-green-500 bg-green-500 text-white',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex shrink-0 items-center justify-center rounded-md opacity-50 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export { Toast };
