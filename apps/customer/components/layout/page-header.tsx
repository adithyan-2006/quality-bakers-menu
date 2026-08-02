import * as React from 'react';
import { cn } from '@qbm/ui';
import { ContentContainer } from './content-container';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('mb-12 md:mb-16', className)} {...props}>
      <ContentContainer>
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-foreground mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </ContentContainer>
    </header>
  );
}
