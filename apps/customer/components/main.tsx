import { Container } from '@qbm/ui';

export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <Container className="py-6 md:py-10">{children}</Container>
    </main>
  );
}
