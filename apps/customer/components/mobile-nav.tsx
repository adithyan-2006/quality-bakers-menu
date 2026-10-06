'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn, buttonVariants } from '@qbm/ui';
import { scrollToSection } from './scroll-to-section';

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const openMenu = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const closeMenu = React.useCallback(() => {
    if (isClosing || !isOpen) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 220);
  }, [isClosing, isOpen]);

  const toggleMenu = React.useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, closeMenu, openMenu]);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen || isClosing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, closeMenu]);

  // Close on outside click / tap
  React.useEffect(() => {
    if (!isOpen || isClosing) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, isClosing, closeMenu]);

  const handleNavClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    closeMenu();
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      scrollToSection(id);
    }
  };

  return (
    <div ref={containerRef} className="md:hidden relative flex items-center">
      <button
        onClick={toggleMenu}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'p-2 text-[#A71920] hover:bg-[#A71920]/10 hover:text-[#A71920] focus-visible:ring-2 focus-visible:ring-[#A71920] rounded-md transition-colors relative z-50',
        )}
        aria-label={isOpen && !isClosing ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen && !isClosing}
      >
        {isOpen && !isClosing ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Subtle backdrop capturing outside clicks without obscuring the page */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/5',
            isClosing ? 'animate-backdrop-out pointer-events-none' : 'animate-backdrop-in',
          )}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Floating Menu Box */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 w-[250px] sm:w-[275px] bg-[#FFF1D8] rounded-3xl shadow-xl border border-[#A71920]/10 p-6 sm:p-7 z-50',
            isClosing ? 'animate-menu-close pointer-events-none' : 'animate-menu-open',
          )}
          role="menu"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-5 sm:gap-6" role="none">
            <Link
              href="/#home"
              role="menuitem"
              onClick={handleNavClick('home')}
              className="font-sans text-[22px] sm:text-[24px] font-medium uppercase tracking-[0.22em] text-[#A71920] hover:opacity-80 transition-opacity"
            >
              HOME
            </Link>
            <Link
              href="/#signature"
              role="menuitem"
              onClick={handleNavClick('signature')}
              className="font-sans text-[22px] sm:text-[24px] font-medium uppercase tracking-[0.22em] text-[#A71920] hover:opacity-80 transition-opacity"
            >
              SIGNATURE
            </Link>
            <Link
              href="/#about"
              role="menuitem"
              onClick={handleNavClick('about')}
              className="font-sans text-[22px] sm:text-[24px] font-medium uppercase tracking-[0.22em] text-[#A71920] hover:opacity-80 transition-opacity"
            >
              ABOUT
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
