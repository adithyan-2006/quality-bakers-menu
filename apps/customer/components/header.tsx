import Link from 'next/link';
import { ScrollHeader } from './scroll-header';
import { Navigation } from './navigation';
import { MobileNav } from './mobile-nav';
import { ContentContainer } from './layout/content-container';

export function Header() {
  return (
    <ScrollHeader>
      <ContentContainer className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link
            href="/"
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Quality Bakers
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Navigation />
        </div>
      </ContentContainer>
    </ScrollHeader>
  );
}
