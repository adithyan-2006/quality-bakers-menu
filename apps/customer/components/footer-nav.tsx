'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { scrollToSection } from './scroll-to-section';

export function FooterBrandLink({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl: string | null;
}) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      scrollToSection('home');
    } else {
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  return (
    <Link
      href="/"
      scroll={false}
      onClick={handleClick}
      className="flex items-center gap-2.5 sm:gap-3 mb-2.5 md:mb-3.5 group outline-none select-none"
    >
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={businessName}
          width={40}
          height={40}
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-contain shrink-0"
        />
      )}
      <h3 className="font-serif text-2xl lg:text-3xl font-bold text-[#BC1D1A] tracking-tight leading-none">
        {businessName}
      </h3>
    </Link>
  );
}

export function FooterQuickLinks() {
  const pathname = usePathname();

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      scrollToSection('home');
    } else {
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      scrollToSection('about');
    }
  };

  return (
    <ul className="flex flex-col space-y-2.5 text-xs lg:text-sm text-[#BC1D1A]/85 font-light">
      <li>
        <Link
          href="/#home"
          scroll={false}
          onClick={handleHomeClick}
          className="hover:text-[#BC1D1A] transition-colors"
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/categories"
          scroll={false}
          onClick={handleMenuClick}
          className="hover:text-[#BC1D1A] transition-colors"
        >
          Menu
        </Link>
      </li>
      <li>
        <Link
          href="/#about"
          scroll={false}
          onClick={handleAboutClick}
          className="hover:text-[#BC1D1A] transition-colors"
        >
          About
        </Link>
      </li>
    </ul>
  );
}
