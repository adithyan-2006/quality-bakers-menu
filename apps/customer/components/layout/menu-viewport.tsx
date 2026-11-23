import * as React from 'react';
import { cn } from '@qbm/ui';

export function MenuViewport({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn('flex-1 bg-[#BC1D1A]', className)} {...props}>
      {children}
    </main>
  );
}
