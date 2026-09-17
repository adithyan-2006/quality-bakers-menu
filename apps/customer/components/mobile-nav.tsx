'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn, buttonVariants } from '@qbm/ui';
import { scrollToSection } from './scroll-to-section';

export function MobileNav() {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <div className="md:hidden flex items-center">
      <button
        onClick={open}
        className={cn(buttonVariants({ variant: 'ghost' }), 'p-2 text-[#FDFADB] -ml-2')}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="backdrop:bg-black/80 m-0 h-full max-h-none w-[85vw] max-w-sm bg-brand-dark p-0 text-brand-cream shadow-2xl open:animate-in open:slide-in-from-left-4 closed:animate-out closed:slide-out-to-left-4"
      >
        <div className="flex h-full flex-col px-8 py-10">
          <div className="mb-14 flex items-center justify-between border-b border-border/50 pb-6">
            <span className="font-serif text-3xl font-bold tracking-tight text-brand-cream">
              Quality Bakers
            </span>
            <button
              onClick={close}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'p-2 text-brand-cream/70 hover:text-brand-cream hover:bg-white/5 -mr-2',
              )}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-8 text-2xl font-serif">
            <Link
              href="/#home"
              onClick={(e) => {
                close();
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  e.preventDefault();
                  scrollToSection('home');
                }
              }}
              className="text-brand-cream/80 hover:text-brand-cream transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#signature"
              onClick={(e) => {
                close();
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  e.preventDefault();
                  scrollToSection('signature');
                }
              }}
              className="text-brand-cream/80 hover:text-brand-cream transition-colors"
            >
              Signature
            </Link>
            <Link
              href="/#about"
              onClick={(e) => {
                close();
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  e.preventDefault();
                  scrollToSection('about');
                }
              }}
              className="text-brand-cream/80 hover:text-brand-cream transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </dialog>
    </div>
  );
}
