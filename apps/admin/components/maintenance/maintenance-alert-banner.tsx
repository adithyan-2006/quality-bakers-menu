'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { MaintenanceConfig } from '@qbm/config';
import Link from 'next/link';

interface MaintenanceAlertBannerProps {
  initialConfig?: MaintenanceConfig | undefined;
}

export function MaintenanceAlertBanner({ initialConfig }: MaintenanceAlertBannerProps) {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);

  const { data: config, isLoading: loading } = useQuery<MaintenanceConfig>({
    queryKey: ['admin-maintenance-status'],
    queryFn: async () => {
      const res = await fetch('/api/admin/maintenance', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to fetch maintenance status');
      }
      return res.json();
    },
    ...(initialConfig ? { initialData: initialConfig } : {}),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance-status'] });
    };
    window.addEventListener('maintenance-mode-changed', handleSync);
    return () => window.removeEventListener('maintenance-mode-changed', handleSync);
  }, [queryClient]);

  const handleDeactivate = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      });
      if (res.ok) {
        const result = await res.json();
        queryClient.setQueryData(['admin-maintenance-status'], result.current);
        window.dispatchEvent(new CustomEvent('maintenance-mode-changed'));
      }
    } catch (err) {
      console.error('Failed to deactivate maintenance mode:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const enabled = Boolean(config?.enabled);

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
