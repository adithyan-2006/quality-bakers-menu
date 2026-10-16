'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { scrollToHashWithRetry } from '../scroll-to-section';

/**
 * Global ScrollManager for App Router.
 * Ensures that all cross-page navigations start cleanly at the top (top: 0),
 * avoiding any "half-way down" landing from inherited scroll positions or Next.js scroll restoration.
 * If navigating to a targeted hash, retries until the section is rendered and scrolled to.
 */
export function ScrollManager() {
  const pathname = usePathname();

  React.useEffect(() => {
    // Disable native browser scroll restoration so Next.js / browser doesn't restore
    // previous scroll offsets halfway down the page on route changes.
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawHash = window.location.hash.replace('#', '');
    const isHomepageHash = rawHash === 'signature' || rawHash === 'about' || rawHash === 'home';

    const forceScrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 60);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 150);
    };

    if (pathname === '/') {
      if (rawHash && rawHash !== 'home') {
        scrollToHashWithRetry(rawHash);
      } else {
        forceScrollToTop();
      }
    } else {
      // Non-homepage (e.g. /categories, /products/[slug]):
      // If the leftover hash was from the homepage (e.g. #signature or #about), clean it!
      if (isHomepageHash) {
        if (window.location.hash) {
          window.history.replaceState(null, '', pathname);
        }
        forceScrollToTop();
      } else if (rawHash) {
        scrollToHashWithRetry(rawHash);
      } else {
        forceScrollToTop();
      }
    }
  }, [pathname]);

  return null;
}
