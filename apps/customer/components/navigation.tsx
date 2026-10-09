'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { scrollToSection } from './scroll-to-section';

export function Navigation() {
  const pathname = usePathname();

  const handleScroll = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      scrollToSection(id);
    }
  };

  return (
    <nav className="flex items-center space-x-8 text-sm font-medium uppercase tracking-wider">
      <Link
        href="/#home"
        onClick={handleScroll('home')}
        className="transition-colors text-[#A71920]/85 hover:text-[#A71920]"
      >
        Home
      </Link>
      <Link
        href="/#signature"
        onClick={handleScroll('signature')}
        className="transition-colors text-[#A71920]/85 hover:text-[#A71920]"
      >
        Signature
      </Link>
      <Link
        href="/#about"
        onClick={handleScroll('about')}
        className="transition-colors text-[#A71920]/85 hover:text-[#A71920]"
      >
        About
      </Link>
    </nav>
  );
}
