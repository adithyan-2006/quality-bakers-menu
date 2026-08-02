import { Stack } from '@qbm/ui';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stack>
      <h1 className="text-3xl font-bold tracking-tight">Category: {slug}</h1>
      <p className="text-muted-foreground">Products for this category will be displayed here.</p>
      {/* TODO: Implement products list for category */}
    </Stack>
  );
}
