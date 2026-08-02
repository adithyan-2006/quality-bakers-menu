import * as React from 'react';
import { cn } from '@qbm/ui';

export function PageSection({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('mb-16 md:mb-24 last:mb-0', className)} {...props}>
      {children}
    </section>
  );
}
