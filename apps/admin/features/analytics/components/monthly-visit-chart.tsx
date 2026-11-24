'use client';

import * as React from 'react';
import { MonthlyVisitStat } from '@qbm/types';
import { TrendingUp, TrendingDown, BarChart2, Table as TableIcon } from 'lucide-react';

interface MonthlyVisitChartProps {
  data: MonthlyVisitStat[];
}

export function MonthlyVisitChart({ data }: MonthlyVisitChartProps) {
  const [viewMode, setViewMode] = React.useState<'chart' | 'table'>('chart');
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const maxVisits = Math.max(...data.map((d) => d.visits), 10);
  const totalVisitsYear = data.reduce((acc, curr) => acc + curr.visits, 0);
  const totalUniqueYear = data.reduce((acc, curr) => acc + curr.uniqueVisitors, 0);

  // Best and lowest month (only if visits > 0)
  const bestMonth = data.reduce<{ label: string; visits: number } | null>((acc, curr) => {
    if (curr.visits > 0 && (!acc || curr.visits > acc.visits)) {
      return { label: curr.label, visits: curr.visits };
    }
    return acc;
  }, null);

  return (
    <div className="bg-white/80 backdrop-blur-md border border-black/[0.07] rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-stone-900">
              Monthly Website Traffic & Trends
            </h3>
            <span className="text-xs text-stone-400">(Past 12 Months)</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Month-over-month volume, visitor growth, and seasonal trends
          </p>
        </div>

        <div className="flex items-center p-1 bg-black/[0.04] border border-black/5 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('chart')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'chart'
                ? 'bg-black text-white shadow-sm'
                : 'text-stone-500 hover:text-black'
            }`}
            title="Chart View"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'table'
                ? 'bg-black text-white shadow-sm'
                : 'text-stone-500 hover:text-black'
            }`}
            title="Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Monthly KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 py-3 px-4 bg-black/[0.02] rounded-xl border border-black/[0.05]">
        <div>
          <span className="text-[11px] text-stone-500 block">Annualized Visits</span>
          <span className="text-lg font-bold text-stone-900">
            {totalVisitsYear.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block">Annual Unique Visitors</span>
          <span className="text-lg font-bold text-sky-600">{totalUniqueYear.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block">Peak Month</span>
          <span className="text-lg font-bold text-emerald-600 truncate block">
            {bestMonth ? `${bestMonth.visits} (${bestMonth.label})` : 'None yet'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block">Active Tracking Months</span>
          <span className="text-lg font-bold text-stone-900">
            {data.filter((d) => d.visits > 0).length} / 12
          </span>
        </div>
      </div>

      {/* Main Content: Chart or Table */}
      {viewMode === 'chart' ? (
        <div className="mt-6">
          {/* Legend */}
          <div className="flex items-center justify-end gap-5 text-xs text-stone-500 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-black inline-block" />
              <span>Total Visits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
              <span>Unique Visitors</span>
            </div>
          </div>

          {/* SVG / Bar Chart */}
          <div className="relative h-64 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-black/[0.06]">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-black/10 w-full" />
              <div className="border-b border-black/10 w-full" />
              <div className="border-b border-black/10 w-full" />
              <div className="border-b border-black/10 w-full" />
            </div>

            {data.map((item, idx) => {
              const visitHeight = Math.max(4, Math.round((item.visits / maxVisits) * 100));
              const uniqueHeight = Math.max(
                item.uniqueVisitors > 0 ? 3 : 0,
                Math.round((item.uniqueVisitors / maxVisits) * 100),
              );
              const isHovered = hoveredIndex === idx;

              // Month-over-month calculation
              const prev = idx > 0 ? data[idx - 1] : null;
              const momChange =
                prev && prev.visits > 0
                  ? Math.round(((item.visits - prev.visits) / prev.visits) * 100)
                  : null;

              return (
                <div
                  key={item.month}
                  className="flex-1 h-full flex items-end justify-center relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-[calc(100%+8px)] z-30 bg-black text-white px-3.5 py-2.5 rounded-lg shadow-xl text-xs whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="font-semibold border-b border-white/20 pb-1 mb-1.5 flex items-center justify-between gap-4">
                        <span>{item.label}</span>
                        {momChange !== null && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              momChange >= 0
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {momChange >= 0 ? `+${momChange}%` : `${momChange}%`} MoM
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between gap-4 py-0.5">
                        <span className="text-stone-300">Total Visits:</span>
                        <strong className="text-white">{item.visits.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between gap-4 py-0.5">
                        <span className="text-sky-300">Unique Visitors:</span>
                        <strong className="text-sky-300">
                          {item.uniqueVisitors.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Paired Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${visitHeight}%` }}
                      className={`w-full max-w-[20px] rounded-t transition-all ${
                        isHovered ? 'bg-stone-700 shadow-md' : 'bg-black hover:opacity-80'
                      }`}
                    />
                    <div
                      style={{ height: `${uniqueHeight}%` }}
                      className={`w-full max-w-[14px] rounded-t transition-all ${
                        isHovered ? 'bg-sky-400' : 'bg-sky-500/80'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Month labels */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-[11px] text-stone-400 pt-2 px-1 text-center">
            {data.map((item) => (
              <span key={item.month} className="truncate">
                {item.label.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* Monthly Table View */
        <div className="mt-4 overflow-x-auto border border-black/[0.08] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] sticky top-0 border-b border-black/[0.08] text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Month</th>
                <th className="py-2.5 px-4">Total Visits</th>
                <th className="py-2.5 px-4">Unique Visitors</th>
                <th className="py-2.5 px-4">Monthly Share</th>
                <th className="py-2.5 px-4 text-right">MoM Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {[...data].reverse().map((item, idx, arr) => {
                const nextItem = arr[idx + 1]; // chronological previous
                const momChange =
                  nextItem && nextItem.visits > 0
                    ? Math.round(((item.visits - nextItem.visits) / nextItem.visits) * 100)
                    : null;
                const sharePercent =
                  totalVisitsYear > 0 ? Math.round((item.visits / totalVisitsYear) * 100) : 0;

                return (
                  <tr key={item.month} className="hover:bg-black/[0.02] transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-stone-900">{item.label}</td>
                    <td className="py-2.5 px-4 font-medium text-stone-800">
                      {item.visits.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-sky-600 font-medium">
                      {item.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      <div className="flex items-center gap-2">
                        <span>{sharePercent}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-black/10 overflow-hidden">
                          <div className="h-full bg-black" style={{ width: `${sharePercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      {momChange === null ? (
                        <span className="text-stone-400">—</span>
                      ) : momChange >= 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <TrendingUp className="w-3 h-3" />+{momChange}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600">
                          <TrendingDown className="w-3 h-3" />
                          {momChange}%
                        </span>
                      )}
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
