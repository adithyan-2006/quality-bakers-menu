'use client';

import * as React from 'react';
import Link from 'next/link';

type LinkProps = React.ComponentProps<typeof Link>;

export function TopScrollLink({ children, onClick, scroll = false, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      scroll={scroll}
      onClick={(e) => {
        // Clear any leftover hash from the source page
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        // Force the window to top instantly before Next.js commits the navigation.
        // This overrides any cached scroll position from Next.js scroll restoration.
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (onClick) {
          onClick(e);
        }
      }}
    >
      {children}
    </Link>
  );
}
