'use client';

import * as React from 'react';
import { RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';
import { WIFI_BREAD_DATA_URI } from './wifi-bread-asset';

interface OfflineFallbackScreenProps {
  onRetry?: () => void;
  isOverlay?: boolean;
}

export function OfflineFallbackScreen({ onRetry, isOverlay = false }: OfflineFallbackScreenProps) {
  const [isChecking, setIsChecking] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string>('Disconnected from network');
  const [statusState, setStatusState] = React.useState<'offline' | 'checking' | 'online' | 'error'>(
    'offline',
  );

  const checkConnection = React.useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    setStatusState('checking');
    setStatusMessage('Testing connection...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`/api/ping?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok || res.status < 400) {
        setStatusState('online');
        setStatusMessage('Connected! Restoring...');
        setTimeout(() => {
          if (onRetry) {
            onRetry();
          } else {
            window.location.reload();
          }
        }, 500);
      } else {
        throw new Error('Unreachable');
      }
    } catch {
      clearTimeout(timeoutId);
      setIsChecking(false);
      setStatusState('error');
      setStatusMessage('Still offline. Please check your Wi-Fi.');
    }
  }, [isChecking, onRetry]);

  // Listen to browser online event for instant automatic reconnection
  React.useEffect(() => {
    const handleOnline = () => {
      setStatusState('online');
      setStatusMessage('Signal detected! Reconnecting...');
      checkConnection();
    };

    const handleOffline = () => {
      setStatusState('offline');
      setStatusMessage('Disconnected from network');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  const containerClasses = isOverlay
    ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-center bg-[#B92B1F] text-[#F4EBDD] overflow-y-auto selection:bg-[#F4EBDD]/20 animate-in fade-in duration-300'
    : 'min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center bg-[#B92B1F] text-[#F4EBDD] selection:bg-[#F4EBDD]/20';

  return (
    <main className={containerClasses}>
      {/* Warm ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,90vw)] h-[min(500px,90vw)] rounded-full bg-[radial-gradient(circle,rgba(244,235,221,0.08)_0%,rgba(185,43,31,0)_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-[580px] w-full mx-auto">
        {/* Exact Wi-Fi bread structure from uploaded image - zero network data URI */}
        <div className="w-full max-w-[320px] flex justify-center items-center select-none">
          <img
            src={WIFI_BREAD_DATA_URI}
            alt="Crumbled Wi-Fi bread"
            width={309}
            height={254}
            className="w-full max-w-[320px] h-auto block pointer-events-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
          />
        </div>

        {/* Headline with exact bold uppercase sans styling */}
        <h1 className="font-extrabold text-[clamp(2.1rem,5.5vw,2.85rem)] uppercase tracking-[0.05em] text-[#F4EBDD] mt-8 leading-[1.15]">
          CRUMBLED!
        </h1>

        {/* Subtitle with exact clean font styling */}
        <p className="text-[clamp(1rem,2.4vw,1.15rem)] font-normal text-[#F4EBDD]/90 mt-3.5 max-w-[480px] leading-[1.6] tracking-wide">
          Your Wi-Fi fell apart into tiny pieces.
          <br className="hidden sm:inline" /> Check your connection and try again.
        </p>

        {/* Interactive Action Group */}
        <div className="mt-8 flex flex-col items-center gap-4 w-full">
          <button
            type="button"
            onClick={checkConnection}
            disabled={isChecking}
            className="inline-flex items-center justify-center gap-2.5 bg-[#F4EBDD] text-[#B92B1F] border-2 border-[#F4EBDD] rounded-full px-8 py-3 text-[0.95rem] font-bold tracking-wide shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:bg-white hover:border-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.28)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(0,0,0,0.2)] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 outline-none cursor-pointer user-select-none"
            aria-label="Retry connection"
          >
            <RefreshCw
              className={`w-4 h-4 transition-transform ${isChecking ? 'animate-spin' : ''}`}
            />
            <span>
              {isChecking ? 'Checking...' : statusState === 'online' ? 'Connected!' : 'Try Again'}
            </span>
          </button>

          {/* Real-time Status Badge */}
          <div
            className={`inline-flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
              statusState === 'online'
                ? 'text-lime-300 opacity-100'
                : statusState === 'error'
                  ? 'text-red-200 opacity-95'
                  : 'text-[#F4EBDD]/80'
            }`}
            role="status"
            aria-live="polite"
          >
            {statusState === 'online' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-300 animate-pulse" />
            ) : statusState === 'error' ? (
              <WifiOff className="w-3.5 h-3.5 text-red-300" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#F4EBDD]/60" />
            )}
            <span>{statusMessage}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
