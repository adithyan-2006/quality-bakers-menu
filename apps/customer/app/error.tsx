'use client';

import * as React from 'react';
import { ErrorState } from '@qbm/ui';
import { OfflineFallbackScreen } from '@/components/offline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [offlineEvent, setOfflineEvent] = React.useState(false);

  React.useEffect(() => {
    const handleOffline = () => setOfflineEvent(true);
    const handleOnline = () => setOfflineEvent(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const isOffline =
    offlineEvent ||
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    Boolean(
      error?.message?.toLowerCase().includes('failed to fetch') ||
      error?.message?.toLowerCase().includes('network') ||
      error?.message?.toLowerCase().includes('offline'),
    );

  if (isOffline) {
    return <OfflineFallbackScreen onRetry={reset} />;
  }

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <ErrorState
        title="Something went wrong"
        message={error.message || 'An unexpected error occurred while loading this page.'}
        onRetry={reset}
      />
    </div>
  );
}
