'use client';

import { Sidebar } from '../../components/layout/sidebar';
import { Header } from '../../components/layout/header';
import { AuthGuard } from '../../components/providers/auth-provider';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
