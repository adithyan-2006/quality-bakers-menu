'use client';

import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { ErrorState } from '@qbm/ui';
import { OfflineFallbackScreen } from '@/components/offline';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isNetworkError = Boolean(
    error?.message?.toLowerCase().includes('failed to fetch') ||
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('offline'),
  );

  if (!isOnline && isNetworkError) {
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
