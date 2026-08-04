import { EditorialIntro } from '../features/home/editorial-intro';
import { FeaturedCategories } from '../features/home/featured-categories';
import { PopularPreview } from '../features/home/popular-preview';
import { SignatureHighlight } from '../features/home/signature-highlight';
import { BrowseCta } from '../features/home/browse-cta';
import { CustomerRepository } from '../repositories/customer-repository';
export const revalidate = 60;
import { buttonVariants } from '@qbm/ui';
import Link from 'next/link';

export default async function HomePage() {
  const [business, homepage, popularProducts] = await Promise.all([
    CustomerRepository.getBusiness(),
    CustomerRepository.getHomepage(),
    CustomerRepository.getPopularProducts(),
  ]);

  if (!homepage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h1 className="text-4xl font-serif font-bold mb-4">Welcome to Quality Bakers</h1>
        <p className="text-muted-foreground mb-8">
          We are currently setting up our digital menu. Please check back soon!
        </p>
        <Link href="/categories" className={buttonVariants({ variant: 'primary' })}>
          Browse Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <EditorialIntro
        homepage={homepage}
        businessName={business?.name || 'Quality Bakers'}
        logoUrl={business?.logo?.secureUrl || business?.logo?.originalUrl}
      />
      <FeaturedCategories categories={homepage.featuredCategories} />
      <PopularPreview products={popularProducts} />
      <SignatureHighlight
        title={homepage.aboutTitle}
        description={homepage.aboutDescription}
        image={homepage.aboutImage}
      />
      <BrowseCta />
    </div>
  );
}
