'use client';

import * as React from 'react';
import Link from 'next/link';

type LinkProps = React.ComponentProps<typeof Link>;

export function TopScrollLink({ children, onClick, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        // Force the window to top instantly before Next.js commits the navigation.
        // This overrides any cached scroll position from Next.js scroll restoration.
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (onClick) {
          onClick(e);
        }
      }}
    >
      {children}
    </Link>
  );
}
