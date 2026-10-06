import { EditorialIntro } from '../features/home/editorial-intro';
import { FeaturedCategories } from '../features/home/featured-categories';
import { PopularPreview } from '../features/home/popular-preview';
import { SignatureHighlight } from '../features/home/signature-highlight';
import { SignatureShowcase } from '../features/home/signature-showcase';
import { CustomerRepository } from '../repositories/customer-repository';
export const revalidate = 60;
import { buttonVariants } from '@qbm/ui';
import Link from 'next/link';

export default async function HomePage() {
  const [business, homepage, popularProducts, signatureProducts] = await Promise.all([
    CustomerRepository.getBusiness(),
    CustomerRepository.getHomepage(),
    CustomerRepository.getPopularProducts(),
    CustomerRepository.getSignatureProducts(),
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

  // Map raw Prisma product rows into MenuProduct shape.
  // The `image` field from Prisma is a nested Media object; we extract the URL here
  // so SignatureShowcase and ProductCard receive a plain string (or undefined).
  const mappedSignatureProducts = signatureProducts.map((p) => {
    const res: any = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.shortDescription,
      categorySlug: p.category?.slug ?? '',
    };
    const imageUrl = p.image?.secureUrl || p.image?.optimizedUrl || p.image?.originalUrl;
    if (imageUrl) res.image = imageUrl;
    if (p.badge && p.badge !== 'NONE') res.badge = p.badge.toLowerCase().replace('_', '-');
    if (p.price) res.price = `₹${p.price}`;
    return res;
  });

  return (
    <div className="flex flex-col w-full bg-[#BC1D1A]">
      <EditorialIntro
        homepage={homepage}
        businessName={business?.name || 'Quality Bakers'}
        logoUrl={business?.logo?.secureUrl || business?.logo?.originalUrl}
      />
      {/* Explore Collections UI */}
      <FeaturedCategories categories={homepage.featuredCategories} />
      <SignatureShowcase products={mappedSignatureProducts} />
      <PopularPreview products={popularProducts} />
      <SignatureHighlight
        title={homepage.aboutTitle}
        description={homepage.aboutDescription}
        image={homepage.aboutImage}
      />
    </div>
  );
}
