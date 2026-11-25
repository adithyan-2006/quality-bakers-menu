'use client';

import * as React from 'react';
import { Clock, Smartphone, Monitor, Tablet, Laptop } from 'lucide-react';

interface RecentVisitItem {
  id: string;
  path: string;
  deviceType: string | null;
  deviceName?: string | null;
  browser: string | null;
  os: string | null;
  createdAt: string;
}

interface RecentVisitsStreamProps {
  visits: RecentVisitItem[];
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentVisitsStream({ visits }: RecentVisitsStreamProps) {
  return (
    <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-black tracking-tight">Live Website Visitors</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Real-time feed of unique visitor sessions showing entry route, device model, browser
              and OS
            </p>
          </div>
        </div>
        <div className="text-xs text-stone-600 font-semibold flex items-center gap-1.5 shrink-0 bg-black/[0.04] border border-black/[0.08] px-3 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-time Stream</span>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="py-10 text-center text-xs text-stone-400">No live visits recorded yet.</div>
      ) : (
        <div className="mt-3 divide-y divide-black/[0.04]">
          {visits.map((v) => {
            const dev = (v.deviceType || 'desktop').toLowerCase();
            const resolvedDeviceName =
              v.deviceName ||
              (dev === 'mobile'
                ? 'Mobile Phone'
                : dev === 'tablet'
                  ? 'Tablet Device'
                  : 'Desktop PC');

            return (
              <div
                key={v.id}
                className="py-3.5 flex items-center justify-between text-xs hover:bg-black/[0.02] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-black/[0.04] text-black border border-black/[0.06] shrink-0">
                    {dev === 'mobile' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : dev === 'tablet' ? (
                      <Tablet className="w-4 h-4" />
                    ) : dev === 'desktop' ? (
                      <Monitor className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-black">{v.path}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white shadow-xs">
                        {resolvedDeviceName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <span>{v.browser || 'Browser'}</span>
                      <span>•</span>
                      <span>{v.os || 'OS'}</span>
                      <span>•</span>
                      <span className="capitalize">{dev}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <span className="text-xs font-semibold text-stone-600 bg-black/[0.04] border border-black/[0.06] px-2.5 py-1 rounded-full">
                    {timeAgo(v.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
