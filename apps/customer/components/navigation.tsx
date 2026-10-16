'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@qbm/ui';
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

export function Navigation() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = React.useState<string>('home');

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

  const handleNavClick = (item: NavItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (item.isExternalPage) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    setActiveSection(item.id);
    if (pathname === '/') {
      e.preventDefault();
      scrollToSection(item.id);
    } else {
      if (item.id === 'home') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  };

  return (
    <nav className="flex items-center space-x-8">
      {NAV_ITEMS.map((item) => {
        const isActive = item.isExternalPage
          ? pathname === item.href || pathname?.startsWith('/categories')
          : pathname === '/' && activeSection === item.id;
        const shouldDisableScroll = !item.isExternalPage && pathname === '/';
        return (
          <Link
            key={item.id}
            href={item.href}
            {...(shouldDisableScroll ? { scroll: false } : {})}
            onClick={handleNavClick(item)}
            className={cn(
              'transition-colors duration-200 font-sans font-bold uppercase tracking-[0.15em] text-xs sm:text-sm',
              isActive ? 'text-[#A71920]' : 'text-[#A71920]/70 hover:text-[#A71920]',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
