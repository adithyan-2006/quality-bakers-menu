import { Stack } from '@qbm/ui';
import { ContentContainer } from '../../../components/layout/content-container';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <ContentContainer className="py-8 sm:py-12 md:py-16">
      <Stack>
        <h1 className="text-3xl font-bold tracking-tight">Category: {slug}</h1>
        <p className="text-muted-foreground">Products for this category will be displayed here.</p>
        {/* TODO: Implement products list for category */}
      </Stack>
    </ContentContainer>
  );
}
