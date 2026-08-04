import { ContentContainer } from './layout/content-container';
import { CustomerRepository } from '../repositories/customer-repository';

export async function Footer() {
  const business = await CustomerRepository.getBusiness();

  return (
    <footer className="border-t border-border/50 py-12 md:py-16 bg-background mt-auto">
      <ContentContainer className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground font-light">
        <div className="flex flex-col items-center md:items-start space-y-1">
          <span className="font-serif text-lg font-medium text-foreground mb-2">
            {business?.name || 'Quality Bakers'}
          </span>
          <span>
            {business?.street
              ? `${business.street}, ${business.city}`
              : '123 Bakery Lane, Pastry City'}
          </span>
          {/* Note: Operating hours are not currently in Prisma schema, so we leave it static or remove */}
          <span>Open Daily: 7am - 7pm</span>
        </div>
        <div className="flex flex-col items-center md:items-end space-y-2">
          {business?.instagram && (
            <a
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Instagram
            </a>
          )}
          {business?.facebook && (
            <a
              href={business.facebook}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Facebook
            </a>
          )}
          {business?.x && (
            <a
              href={business.x}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Twitter / X
            </a>
          )}
          {business?.phone && (
            <a
              href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
              className="hover:text-primary transition-colors"
            >
              {business.phone}
            </a>
          )}
          {business?.email && (
            <a href={`mailto:${business.email}`} className="hover:text-primary transition-colors">
              {business.email}
            </a>
          )}
          <span className="mt-4 text-xs opacity-60">
            &copy; {new Date().getFullYear()} {business?.name || 'Quality Bakers'}.
          </span>
        </div>
      </ContentContainer>
    </footer>
  );
}
