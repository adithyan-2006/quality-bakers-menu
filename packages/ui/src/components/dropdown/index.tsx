import * as React from 'react';
import { cn } from '../../lib/cn';

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

/** Root Dropdown container */
const DropdownRoot = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ isOpen, children, className, ...props }, ref) => {
    return (
      <div className={cn("relative inline-block text-left", className)} ref={ref} {...props}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Propagate isOpen to trigger aria-expanded and to conditionally render Content
            return React.cloneElement(child, { isOpen } as any);
          }
          return child;
        })}
      </div>
    );
  }
);
DropdownRoot.displayName = 'Dropdown';

/** Dropdown Trigger button */
const DropdownTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { isOpen?: boolean }>(
  ({ className, isOpen, ...props }, ref) => (
    <button 
      ref={ref} 
      type="button" 
      aria-haspopup="menu" 
      aria-expanded={isOpen} 
      className={className} 
      {...props} 
    />
  )
);
DropdownTrigger.displayName = 'Dropdown.Trigger';

/** Dropdown Content container */
const DropdownContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { isOpen?: boolean }>(
  ({ className, isOpen, children, ...props }, ref) => {
    if (!isOpen) return null;
    return (
      <div
        ref={ref}
        role="menu"
        aria-orientation="vertical"
        className={cn(
          'absolute right-0 z-[50] mt-2 w-56 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-80 zoom-in-95 motion-reduce:transition-none motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        <div className="py-1" role="none">
          {children}
        </div>
      </div>
    );
  }
);
DropdownContent.displayName = 'Dropdown.Content';

/** Dropdown Item */
const DropdownItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      role="menuitem"
      className={cn(
        'block w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
DropdownItem.displayName = 'Dropdown.Item';

/** Dropdown Separator */
const DropdownSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
);
DropdownSeparator.displayName = 'Dropdown.Separator';

/**
 * Primitive compound Dropdown component.
 * Intended for user menus and action lists.
 */
export const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Separator: DropdownSeparator,
});
