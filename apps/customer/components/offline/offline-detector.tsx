'use client';

import * as React from 'react';
import { OfflineFallbackScreen } from './offline-fallback-screen';

export function OfflineDetector() {
  const [isOffline, setIsOffline] = React.useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  React.useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = async () => {
      // Verify real connectivity with /api/ping before dismissing
      try {
        const res = await fetch(`/api/ping?t=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
        });
        if (res.ok || res.status < 400) {
          setIsOffline(false);
          return;
        }
      } catch {
        // Still unreachable
      }
      setIsOffline(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <OfflineFallbackScreen
      isOverlay
      onRetry={() => {
        setIsOffline(false);
      }}
    />
  );
}
