import * as React from 'react';
import { cn } from '../../lib/cn';

export type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Toggle switch component (built natively over checkbox).
 * Intended for immediate-action settings or feature flags.
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
      <div
        className={cn(
          "h-6 w-11 rounded-full bg-input peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white",
          className,
        )}
      ></div>
    </label>
  );
});
Switch.displayName = 'Switch';

export { Switch };
