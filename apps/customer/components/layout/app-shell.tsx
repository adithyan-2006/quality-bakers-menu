import * as React from 'react';
import { PageContainer } from './page-container';
import { MenuViewport } from './menu-viewport';
import { Header } from '../header';
import { Footer } from '../footer';
import { ScrollManager } from './scroll-manager';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <ScrollManager />
      <Header />
      <MenuViewport>{children}</MenuViewport>
      <Footer />
    </PageContainer>
  );
}
