'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn, buttonVariants } from '@qbm/ui';
import { scrollToSection, scrollToHashWithRetry } from './scroll-to-section';

interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternalPage?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '/#home' },
  { id: 'signature', label: 'Signature', href: '/#signature' },
  { id: 'menu', label: 'Menu', href: '/categories', isExternalPage: true },
  { id: 'about', label: 'About', href: '/#about' },
];

export function MobileNav() {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>('home');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close menu automatically whenever route changes (React 19 render-phase pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setIsClosing(false);
  }

  // Synchronize active section on scroll & hash when on homepage
  React.useEffect(() => {
    if (pathname !== '/') return;

    let rafId: number | null = null;

    const determineActiveSection = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        return 'about';
      }

      const activationLine = 140;
      let current = 'home';

      for (const item of NAV_ITEMS) {
        if (item.isExternalPage) continue;
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= activationLine) {
            current = item.id;
          } else {
            break;
          }
        }
      }
      return current;
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const current = determineActiveSection();
        setActiveSection(current);
      });
    };

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash === 'signature' || hash === 'about' || hash === 'home') {
        setActiveSection(hash);
        scrollToHashWithRetry(hash);
      }
    };

    if (window.location.hash) {
      handleHash();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handleHash);
    window.addEventListener('hashchange', handleHash);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handleHash);
      window.removeEventListener('hashchange', handleHash);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [pathname]);

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

  // Clean up timer on unmount or route change
  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [pathname]);

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

  const handleNavClick =
    (id: string, isExternalPage?: boolean) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isExternalPage) {
        return;
      }
      closeMenu();
      setActiveSection(id);
      if (pathname === '/') {
        e.preventDefault();
        scrollToSection(id);
      } else {
        scrollToHashWithRetry(id);
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
          <nav className="flex flex-col gap-4 sm:gap-5" role="none">
            {NAV_ITEMS.map(({ id, label, href, isExternalPage }) => {
              const isCurrent = isExternalPage
                ? pathname === href || pathname?.startsWith('/categories')
                : pathname === '/' && activeSection === id;
              return (
                <Link
                  key={id}
                  href={href}
                  scroll={false}
                  role="menuitem"
                  onClick={handleNavClick(id, isExternalPage)}
                  className={cn(
                    'font-sans font-bold uppercase tracking-[0.15em] text-base sm:text-lg transition-colors',
                    isCurrent ? 'text-[#A71920]' : 'text-[#A71920]/70 hover:text-[#A71920]',
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
