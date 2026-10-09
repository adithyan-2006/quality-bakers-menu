import { ContentContainer } from './layout/content-container';
import { CustomerRepository } from '../repositories/customer-repository';

export async function Footer() {
  const business = await CustomerRepository.getBusiness();

  return (
    <footer className="border-t border-[#BC1D1A]/15 py-12 md:py-16 bg-[#FDFADB] mt-auto">
      <ContentContainer className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#BC1D1A]/80 font-light">
        <div className="flex flex-col items-center md:items-start space-y-1">
          <span className="font-serif text-lg font-medium text-[#BC1D1A] mb-2">
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
              className="text-[#BC1D1A]/80 hover:text-[#BC1D1A] transition-colors"
            >
              Instagram
            </a>
          )}
          {business?.facebook && (
            <a
              href={business.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-[#BC1D1A]/80 hover:text-[#BC1D1A] transition-colors"
            >
              Facebook
            </a>
          )}
          {business?.x && (
            <a
              href={business.x}
              target="_blank"
              rel="noreferrer"
              className="text-[#BC1D1A]/80 hover:text-[#BC1D1A] transition-colors"
            >
              Twitter / X
            </a>
          )}
          {business?.phone && (
            <a
              href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
              className="text-[#BC1D1A]/80 hover:text-[#BC1D1A] transition-colors"
            >
              {business.phone}
            </a>
          )}
          {business?.email && (
            <a
              href={`mailto:${business.email}`}
              className="text-[#BC1D1A]/80 hover:text-[#BC1D1A] transition-colors"
            >
              {business.email}
            </a>
          )}
          <span className="mt-4 text-xs text-[#BC1D1A]/60">
            &copy; {new Date().getFullYear()} {business?.name || 'Quality Bakers'}.
          </span>
        </div>
      </ContentContainer>
    </footer>
  );
}
