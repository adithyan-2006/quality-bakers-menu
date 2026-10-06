import { ScrollHeader } from './scroll-header';
import { Navigation } from './navigation';
import { CustomerRepository } from '../repositories/customer-repository';

export async function Header() {
  const business = await CustomerRepository.getBusiness();
  const logoUrl =
    (business?.logo ? business.logo.secureUrl || business.logo.originalUrl : null) ||
    '/images/quality-bakers-logo.png';

  return (
    <ScrollHeader businessName={business?.name || 'Quality Bakers'} logoUrl={logoUrl}>
      <Navigation />
    </ScrollHeader>
  );
}
