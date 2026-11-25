'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { MaintenanceConfig } from '@qbm/config';

interface MaintenanceToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
  onStateChange?: (config: MaintenanceConfig) => void;
}

export function MaintenanceToggle({
  variant = 'compact',
  className = '',
  onStateChange,
}: MaintenanceToggleProps) {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [retryAfterMinutes, setRetryAfterMinutes] = useState(5);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/maintenance', { cache: 'no-store' });
      if (res.ok) {
        const data: MaintenanceConfig = await res.json();
        setConfig(data);
        setCustomMessage(data.message || '');
        if (data.retryAfter) {
          setRetryAfterMinutes(Math.round(data.retryAfter / 60));
        }
      }
    } catch (err) {
      console.error('[MaintenanceToggle] Failed to fetch maintenance status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();

    const handleSync = () => {
      fetchStatus();
    };

    window.addEventListener('maintenance-mode-changed', handleSync);
    return () => {
      window.removeEventListener('maintenance-mode-changed', handleSync);
    };
  }, [fetchStatus]);

  const handleToggleClick = () => {
    if (!config || actionLoading) return;
    const nextState = !config.enabled;
    setPendingState(nextState);
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    if (pendingState === null) return;

    try {
      setActionLoading(true);
      setErrorMsg(null);

      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: pendingState,
          message: customMessage || undefined,
          retryAfter: retryAfterMinutes * 60,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update maintenance mode');
      }

      const result = await res.json();
      setConfig(result.current);
      setShowConfirmModal(false);
      setPendingState(null);

      if (onStateChange) {
        onStateChange(result.current);
      }

      // Dispatch global event so header and settings pages sync immediately
      window.dispatchEvent(new CustomEvent('maintenance-mode-changed'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const isEnabled = Boolean(config?.enabled);

  if (loading && !config) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-stone-400 ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading status...</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'compact' ? (
        // Header Compact Toggle & Status Badge
        <div className={`flex items-center gap-3 ${className}`}>
          {/* Status Badge */}
          {isEnabled ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-xs"
              title="Public storefront is currently closed for maintenance"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <span className="font-bold">Under Maintenance</span>
            </div>
          ) : (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black text-white shadow-xs"
              title="Public website is live and open to customers"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Site Live</span>
            </div>
          )}

          {/* Switch Button */}
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={handleToggleClick}
            disabled={actionLoading}
            className={`
              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2
              ${isEnabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'}
              ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={
              isEnabled
                ? 'Click to deactivate maintenance mode'
                : 'Click to activate maintenance mode'
            }
          >
            <span className="sr-only">Toggle maintenance mode</span>
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 
                transition duration-200 ease-in-out
                ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      ) : (
        // Full View (for Settings Page)
        <div className={`space-y-6 ${className}`}>
          {/* Main Status & Action Card */}
          <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 md:p-8 shadow-glass">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black/[0.06]">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-black">Maintenance Mode</h3>
                  {isEnabled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse"></span>
                      Under Maintenance
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black text-white">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Site Live
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-600 max-w-xl">
                  When enabled, all public visitors are intercepted with HTTP 503 and served the
                  custom bakery maintenance page. Admin routes (
                  <code className="px-1.5 py-0.5 rounded bg-black/[0.05] font-mono text-xs text-black">
                    /admin
                  </code>
                  ,{' '}
                  <code className="px-1.5 py-0.5 rounded bg-black/[0.05] font-mono text-xs text-black">
                    /login
                  </code>
                  ) remain whitelisted.
                </p>
              </div>

              {/* Action Button & Toggle */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-stone-600">
                  {isEnabled ? 'Turn Off Maintenance' : 'Turn On Maintenance'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  onClick={handleToggleClick}
                  disabled={actionLoading}
                  className={`
                    relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
                    ${isEnabled ? 'bg-rose-600' : 'bg-stone-300 hover:bg-stone-400'}
                    ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="sr-only">Toggle maintenance mode</span>
                  <span
                    className={`
                      pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 
                      transition duration-200 ease-in-out
                      ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* Status Details */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/[0.02] border border-black/[0.06]">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Status</p>
                <p className="text-base font-bold mt-1 text-black">
                  {isEnabled ? 'Active (503 Service Unavailable)' : 'Normal Operations (200 OK)'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/[0.02] border border-black/[0.06]">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                  Last Changed
                </p>
                <p className="text-sm font-semibold mt-1 text-black truncate">
                  {config?.activatedAt
                    ? new Date(config.activatedAt).toLocaleString()
                    : config?.deactivatedAt
                      ? new Date(config.deactivatedAt).toLocaleString()
                      : 'System startup'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/[0.02] border border-black/[0.06]">
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                  Changed By
                </p>
                <p className="text-sm font-semibold mt-1 text-black truncate">
                  {config?.activatedBy || 'Administrator'}
                </p>
              </div>
            </div>

            {/* Live Preview & Info Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/[0.06]">
              <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero downtime toggle • Whitelisted routes are never locked out</span>
              </div>

              <a
                href="/maintenance.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-black/[0.04] hover:bg-black hover:text-white border border-black/[0.08] text-black transition-all"
              >
                <span>Preview Maintenance Page</span>
                <span className="text-xs opacity-60">↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog / Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full shrink-0 ${
                  pendingState ? 'bg-rose-100 text-rose-600' : 'bg-black text-white'
                }`}
              >
                {pendingState ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-black">
                  {pendingState ? 'Activate Maintenance Mode?' : 'Deactivate Maintenance Mode?'}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {pendingState ? (
                    <>
                      All public storefront visitors will be intercepted and shown the{' '}
                      <strong>503 "System Baked"</strong> maintenance page. Admin routes (
                      <code className="text-xs font-mono bg-black/[0.05] text-black px-1.5 py-0.5 rounded">
                        /admin
                      </code>
                      ,{' '}
                      <code className="text-xs font-mono bg-black/[0.05] text-black px-1.5 py-0.5 rounded">
                        /login
                      </code>
                      ) remain accessible.
                    </>
                  ) : (
                    <>
                      The public website will be restored immediately. Normal customers will be able
                      to browse the bakery menu and products again.
                    </>
                  )}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingState(null);
                  setErrorMsg(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-black hover:bg-black/5 rounded-xl border border-black/[0.06] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                disabled={actionLoading}
                className={`
                  inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition-all cursor-pointer
                  ${
                    pendingState
                      ? 'bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-rose-500'
                      : 'bg-black hover:bg-neutral-800 focus:ring-2 focus:ring-black'
                  }
                  ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{pendingState ? 'Confirm & Turn ON' : 'Confirm & Turn OFF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
