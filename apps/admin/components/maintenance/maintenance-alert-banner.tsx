'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function MaintenanceAlertBanner() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/admin/maintenance', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setEnabled(Boolean(data.enabled));
      }
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkStatus();

    const handleSync = () => checkStatus();
    window.addEventListener('maintenance-mode-changed', handleSync);
    return () => window.removeEventListener('maintenance-mode-changed', handleSync);
  }, []);

  const handleDeactivate = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      });
      if (res.ok) {
        setEnabled(false);
        window.dispatchEvent(new CustomEvent('maintenance-mode-changed'));
      }
    } catch (err) {
      console.error('Failed to deactivate maintenance mode:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !enabled) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-black/[0.08] bg-white/85 p-4 shadow-glass backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-black text-white shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-black">Maintenance Mode is Currently Active</p>
            <p className="text-xs text-stone-600">
              Customer storefront is responding with HTTP 503 &amp; serving the "System Baked" page.
              Admin routes remain whitelisted.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <Link
            href="/settings"
            className="text-xs font-semibold text-stone-600 hover:text-black hover:underline flex items-center gap-1 transition-colors"
          >
            Manage in Settings <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-black hover:bg-neutral-800 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            <span>Turn Off</span>
          </button>
        </div>
      </div>
    </div>
  );
}
