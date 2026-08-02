import * as React from 'react';
import { cn } from '@qbm/ui';

export function MenuViewport({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn('flex-1 pt-6 pb-24 md:pt-10 md:pb-32', className)} {...props}>
      {children}
    </main>
  );
}
