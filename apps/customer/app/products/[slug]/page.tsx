import { Stack } from '@qbm/ui';
import { TopScrollLink } from '../../../components/top-scroll-link';
import { ContentContainer } from '../../../components/layout/content-container';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <ContentContainer className="py-8 sm:py-12 md:py-16">
      <Stack>
        <TopScrollLink href="/categories" className="text-sm text-primary hover:underline">
          &larr; Back to Menu
        </TopScrollLink>
        <h1 className="text-3xl font-bold tracking-tight">Product: {slug}</h1>
        <p className="text-muted-foreground">
          Product details, ingredients, allergens, and price will be displayed here.
        </p>
        {/* TODO: Implement product detail view */}
      </Stack>
    </ContentContainer>
  );
}
