'use client';

import * as React from 'react';

import { Dialog } from '../dialog';

export interface ModalProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

/**
 * High-level Modal abstraction built on Dialog.
 * Intended for complex forms and overlay workflows.
 */
const ModalRoot = React.forwardRef<HTMLDialogElement, ModalProps>(
  ({ isOpen, onClose, title, description, children, className, ...props }, ref) => {
    return (
      <Dialog open={isOpen} onClose={onClose} ref={ref} className={className} {...props}>
        <div className="flex flex-col space-y-4">
          {(title || description) && (
            <Dialog.Header className="border-b pb-4">
              <div className="flex items-center justify-between">
                {title && <Dialog.Title>{title}</Dialog.Title>}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
              {description && <Dialog.Description>{description}</Dialog.Description>}
            </Dialog.Header>
          )}
          <Dialog.Content className="p-0">{children}</Dialog.Content>
        </div>
      </Dialog>
    );
  },
);
ModalRoot.displayName = 'Modal';

export const Modal = ModalRoot;
