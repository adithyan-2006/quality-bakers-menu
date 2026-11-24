'use client';

import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { OfflineFallbackScreen } from './offline-fallback-screen';

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

export function OfflineDetector() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [retryKey, setRetryKey] = React.useState(0);

  // When online, do not render any overlay
  if (isOnline) {
    return null;
  }

  return (
    <OfflineFallbackScreen
      key={retryKey}
      isOverlay
      onRetry={() => {
        setRetryKey((prev) => prev + 1);
      }}
    />
  );
}
