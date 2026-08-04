import Link from 'next/link';
import { ScrollHeader } from './scroll-header';
import { Navigation } from './navigation';
import { MobileNav } from './mobile-nav';
import { ContentContainer } from './layout/content-container';
import { CustomerRepository } from '../repositories/customer-repository';

export async function Header() {
  const business = await CustomerRepository.getBusiness();

  return (
    <ScrollHeader>
      <ContentContainer className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link
            href="/"
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            {business?.logo ? (
              <img
                src={business.logo.secureUrl || business.logo.originalUrl}
                alt={business.logo.altText || business.name}
                className="h-8 w-auto object-contain"
              />
            ) : null}
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {business?.name || 'Quality Bakers'}
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
