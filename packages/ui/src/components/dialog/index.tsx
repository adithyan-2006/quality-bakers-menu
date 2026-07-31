import * as React from 'react';
import { cn } from '../../lib/cn';

export interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onClose?: () => void;
}

/** Root Dialog primitive managing the native <dialog> element */
const DialogRoot = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDialogElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!);

    React.useEffect(() => {
      const dialog = internalRef.current;
      if (!dialog) return;
      if (open) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }, [open]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      const dialogNode = internalRef.current;
      if (dialogNode && e.target === dialogNode && onClose) {
        onClose();
      }
    };

    return (
      <dialog
        ref={internalRef}
        onClose={onClose}
        onClick={handleBackdropClick}
        aria-modal="true"
        className={cn(
          'backdrop:bg-black/50 open:animate-in open:fade-in-90 open:zoom-in-95 m-auto rounded-lg border bg-background shadow-lg sm:max-w-[425px] motion-reduce:transition-none motion-reduce:transform-none',
          className
        )}
        {...props}
      >
        {children}
      </dialog>
    );
  }
);
DialogRoot.displayName = 'Dialog';

/** Trigger button for opening the dialog */
const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} type="button" aria-haspopup="dialog" className={className} {...props} />
  )
);
DialogTrigger.displayName = 'Dialog.Trigger';

/** Dialog content wrapper */
const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
);
DialogContent.displayName = 'Dialog.Content';

/** Dialog header */
const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
  )
);
DialogHeader.displayName = 'Dialog.Header';

/** Dialog title */
const DialogTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
DialogTitle.displayName = 'Dialog.Title';

/** Dialog description */
const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
DialogDescription.displayName = 'Dialog.Description';

/** Dialog footer for actions */
const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
  )
);
DialogFooter.displayName = 'Dialog.Footer';

/**
 * Accessible compound Dialog component.
 * Intended for alerts or workflows requiring user focus.
 */
export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
});
