import { Stack } from '@qbm/ui';
import { ContentContainer } from '../../components/layout/content-container';

export default function SearchPage() {
  return (
    <ContentContainer>
      <Stack>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">Find your favorite baked goods.</p>
        {/* TODO: Implement search input and results grid */}
      </Stack>
    </ContentContainer>
  );
}
