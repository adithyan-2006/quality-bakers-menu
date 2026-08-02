import { Stack } from '@qbm/ui';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Stack>
      <Link href="/categories" className="text-sm text-primary hover:underline">
        &larr; Back to Menu
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Product: {slug}</h1>
      <p className="text-muted-foreground">
        Product details, ingredients, allergens, and price will be displayed here.
      </p>
      {/* TODO: Implement product detail view */}
    </Stack>
  );
}
