import * as React from 'react';
import { cn } from '@qbm/ui';

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function SectionTitle({
  className,
  as: Component = 'h2',
  children,
  ...props
}: SectionTitleProps) {
  return (
    <Component
      className={cn(
        'text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-brand-cream mb-6 md:mb-10',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
