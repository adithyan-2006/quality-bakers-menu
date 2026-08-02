'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn, buttonVariants } from '@qbm/ui';

export function MobileNav() {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <div className="md:hidden flex items-center">
      <button
        onClick={open}
        className={cn(buttonVariants({ variant: 'ghost' }), 'p-2 text-foreground -ml-2')}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="backdrop:bg-black/60 m-0 h-full max-h-none w-[85vw] max-w-sm bg-background p-0 text-foreground shadow-2xl open:animate-in open:slide-in-from-left-4 closed:animate-out closed:slide-out-to-left-4"
      >
        <div className="flex h-full flex-col px-6 py-5">
          <div className="mb-10 flex items-center justify-between">
            <span className="font-serif text-2xl font-semibold tracking-tight">Quality Bakers</span>
            <button
              onClick={close}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'p-2 text-muted-foreground -mr-2',
              )}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-6 text-xl font-medium font-serif">
            <Link href="/" onClick={close} className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link
              href="/categories"
              onClick={close}
              className="hover:text-primary transition-colors"
            >
              Menu
            </Link>
            <Link href="/search" onClick={close} className="hover:text-primary transition-colors">
              Search
            </Link>
            <Link href="/about" onClick={close} className="hover:text-primary transition-colors">
              About Us
            </Link>
          </nav>
        </div>
      </dialog>
    </div>
  );
}
