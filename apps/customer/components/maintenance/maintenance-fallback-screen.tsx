'use client';

import * as React from 'react';
import { RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { TOASTER_DATA_URI } from './toaster-asset';
import { DEFAULT_MAINTENANCE_MESSAGE } from '@qbm/config';

export interface MaintenanceFallbackScreenProps {
  onRetry?: (() => void) | undefined;
  message?: string | undefined;
  retryAfter?: number | undefined;
  fullScreen?: boolean | undefined;
}

export function MaintenanceFallbackScreen({
  onRetry,
  message,
  retryAfter: _retryAfter = 300,
  fullScreen = true,
}: MaintenanceFallbackScreenProps) {
  const [isChecking, setIsChecking] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string>(
    'Auto-refreshing when system is ready...',
  );
  const [isRestored, setIsRestored] = React.useState(false);

  const displayMessage = message || DEFAULT_MAINTENANCE_MESSAGE;

  // Manual or automatic status check
  const checkMaintenanceStatus = React.useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    setStatusMessage('Checking oven status...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(`/api/maintenance/status?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'x-maintenance-check': '1',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.enabled === false) {
          setIsRestored(true);
          setStatusMessage('System restored! Loading fresh menu...');
          setTimeout(() => {
            if (onRetry) {
              onRetry();
            } else {
              window.location.reload();
            }
          }, 600);
          return;
        }
      }

      setIsChecking(false);
      setStatusMessage('Ovens are still warming up. Checking shortly...');
    } catch {
      clearTimeout(timeoutId);
      setIsChecking(false);
      setStatusMessage('Checking shortly...');
    }
  }, [isChecking, onRetry]);

  // Periodic silent polling to automatically reload once maintenance ends
  React.useEffect(() => {
    const interval = setInterval(() => {
      checkMaintenanceStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [checkMaintenanceStatus]);

  // Online recovery trigger
  React.useEffect(() => {
    const handleOnline = () => {
      checkMaintenanceStatus();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [checkMaintenanceStatus]);

  return (
    <main
      className={`flex flex-col items-center justify-center p-6 text-center select-none bg-[#B92B1F] text-[#F4EBDD] ${
        fullScreen ? 'min-h-screen min-h-[100dvh] w-full' : 'h-full w-full py-12'
      }`}
      style={{ backgroundColor: '#B92B1F', color: '#F4EBDD' }}
    >
      {/* Brand Oven Illustration */}
      <div className="w-full max-w-[280px] sm:max-w-[295px] flex justify-center items-center mx-auto mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TOASTER_DATA_URI}
          alt="Quality Bakers Oven"
          className="w-full h-auto object-contain pointer-events-none drop-shadow-md"
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      <h1 className="font-extrabold uppercase tracking-wider text-2xl sm:text-3xl md:text-4xl text-[#F4EBDD] mt-4 leading-tight">
        oops! system baked
      </h1>

      <p className="text-sm sm:text-base text-[#F4EBDD]/90 max-w-lg mt-3 leading-relaxed px-4">
        {displayMessage}
      </p>

      {/* Manual Check / Action Button */}
      <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (onRetry) {
              onRetry();
            }
            checkMaintenanceStatus();
          }}
          disabled={isChecking || isRestored}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm bg-[#F4EBDD] text-[#B92B1F] hover:bg-white active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
        >
          {isRestored ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>Restored!</span>
            </>
          ) : (
            <>
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Refresh Menu'}</span>
            </>
          )}
        </button>
      </div>

      {/* Background Auto-Sync Status Indicator */}
      <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-[#F4EBDD]/80 bg-[#a02419]/70 border border-[#F4EBDD]/20">
        <span className="relative flex h-2 w-2">
          {isRestored ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </>
          )}
        </span>
        <span>{statusMessage}</span>
      </div>

      {/* Footer subtle brand note */}
      <p className="mt-8 text-xs text-[#F4EBDD]/50 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Quality Bakers &middot; Always fresh from the oven</span>
      </p>
    </main>
  );
}
export default MaintenanceFallbackScreen;
