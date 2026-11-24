'use client';

import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { OfflineFallbackScreen } from '@/components/offline';
import { MaintenanceFallbackScreen } from '@/components/maintenance';

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

  const errorMsg = (error?.message || '').toLowerCase();
  const isNetworkError = Boolean(
    errorMsg.includes('failed to fetch') ||
    errorMsg.includes('network') ||
    errorMsg.includes('offline'),
  );

  // 1. Offline fallback when client device has no connection
  if (!isOnline && isNetworkError) {
    return <OfflineFallbackScreen onRetry={reset} />;
  }

  // 2. Server, database, 503, or maintenance fallback
  // Renders the branded "Oops! System Baked" screen with auto-retry and oven illustration
  return (
    <MaintenanceFallbackScreen
      onRetry={reset}
      message={
        errorMsg.includes('maintenance') || errorMsg.includes('503')
          ? undefined
          : "Our ovens are currently taking a quick breather. We're tuning things up and will be right back!"
      }
      fullScreen={true}
    />
  );
}
