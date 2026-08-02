import * as React from 'react';
import { cn } from '@qbm/ui';

export function PageContainer({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col min-h-screen bg-background', className)} {...props}>
      {children}
    </div>
  );
}
