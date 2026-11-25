'use client';

import * as React from 'react';
import { PageVisitStat } from '@qbm/types';
import { Globe } from 'lucide-react';

interface TopPagesTableProps {
  pages: PageVisitStat[];
  totalVisits: number;
}

function getFriendlyPathLabel(path: string): string {
  if (path === '/') return 'Menu Homepage';
  if (path === '/dashboard') return 'Admin Dashboard';
  if (path === '/categories') return 'Category Directory';
  if (path === '/products') return 'Product Catalog';
  if (path === '/login') return 'Admin Login';
  if (path === '/settings') return 'Settings';
  if (path.startsWith('/categories/')) {
    const slug = path.replace('/categories/', '');
    return `Category: ${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
  }
  if (path.startsWith('/products/')) {
    const slug = path.replace('/products/', '');
    return `Product: ${slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')}`;
  }
  return path;
}

export function TopPagesTable({ pages, totalVisits }: TopPagesTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-black/[0.07] rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
        <div>
          <h3 className="text-base font-semibold text-stone-900">Top Visited Pages</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Most popular sections and menu items visited by users
          </p>
        </div>
        <div className="p-2 bg-black/[0.04] text-stone-900 border border-black/5 rounded-lg">
          <Globe className="w-4 h-4 text-stone-700" />
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="py-12 text-center text-sm text-stone-400">No page visits recorded yet.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-stone-500 font-semibold uppercase tracking-wider border-b border-black/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Page Name & Route</th>
                <th className="py-2.5 px-3">Visits</th>
                <th className="py-2.5 px-3">Unique Visitors</th>
                <th className="py-2.5 px-3 text-right">Traffic Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {pages.map((page, idx) => {
                const percent =
                  totalVisits > 0 ? Math.round((page.visits / totalVisits) * 100) : page.percentage;
                const friendlyLabel = getFriendlyPathLabel(page.path);

                return (
                  <tr key={page.path + idx} className="hover:bg-black/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-stone-900">{friendlyLabel}</span>
                        <span className="font-mono text-[11px] text-stone-400">{page.path}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">
                      {page.visits.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-sky-600 font-medium">
                      {page.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium text-stone-700">{percent}%</span>
                        <div className="w-20 h-1.5 rounded-full bg-black/10 overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full"
                            style={{ width: `${Math.max(4, percent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
