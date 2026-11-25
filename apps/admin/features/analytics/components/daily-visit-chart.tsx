'use client';

import * as React from 'react';
import { DailyVisitStat } from '@qbm/types';
import { BarChart3, Table as TableIcon } from 'lucide-react';

interface DailyVisitChartProps {
  data: DailyVisitStat[];
  activeDays: number;
  onDaysChange: (days: number) => void;
  isLoading?: boolean;
}

export function DailyVisitChart({
  data,
  activeDays,
  onDaysChange,
  isLoading,
}: DailyVisitChartProps) {
  const [viewMode, setViewMode] = React.useState<'chart' | 'table'>('chart');
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const maxVisits = Math.max(...data.map((d) => d.visits), 10);
  const totalVisitsInRange = data.reduce((acc, curr) => acc + curr.visits, 0);
  const totalUniqueInRange = data.reduce((acc, curr) => acc + curr.uniqueVisitors, 0);
  const avgInRange = data.length > 0 ? Math.round((totalVisitsInRange / data.length) * 10) / 10 : 0;

  // Find peak day (only if visits > 0)
  const peak = data.reduce<{ date: string; visits: number } | null>((acc, curr) => {
    if (curr.visits > 0 && (!acc || curr.visits > acc.visits)) {
      return { date: curr.label, visits: curr.visits };
    }
    return acc;
  }, null);

  return (
    <div className="bg-white/80 backdrop-blur-md border border-black/[0.07] rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-stone-900">Daily Website Visits</h3>
            <span className="text-xs text-stone-400">({data.length} days)</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Breakdown of daily website visits (sessions) vs. unique visitors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Days selector */}
          <div className="flex items-center p-1 bg-black/[0.04] border border-black/5 rounded-lg text-xs font-medium">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => onDaysChange(d)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeDays === d
                    ? 'bg-black text-white shadow-sm font-semibold'
                    : 'text-stone-500 hover:text-black'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {/* View mode toggle */}
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
              <BarChart3 className="w-3.5 h-3.5" />
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
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 py-3 px-4 bg-black/[0.02] rounded-xl border border-black/[0.05]">
        <div>
          <span className="text-[11px] text-stone-500 block">Total Visits in Period</span>
          <span className="text-lg font-bold text-stone-900">
            {totalVisitsInRange.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block">Unique Visitors</span>
          <span className="text-lg font-bold text-sky-600">
            {totalUniqueInRange.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block">Daily Average</span>
          <span className="text-lg font-bold text-stone-900">{avgInRange}</span>
        </div>
        <div>
          <span className="text-[11px] text-stone-500 block">Peak Day</span>
          <span className="text-lg font-bold text-amber-600 truncate block">
            {peak ? `${peak.visits} (${peak.date})` : 'None yet'}
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

          {/* SVG/HTML Bar Chart */}
          <div className="relative h-64 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-black/[0.06]">
            {/* Background grid lines */}
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

              return (
                <div
                  key={item.date}
                  className="flex-1 h-full flex items-end justify-center relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-[calc(100%+8px)] z-30 bg-black text-white px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="font-semibold border-b border-white/20 pb-1 mb-1">
                        {item.date} ({item.label})
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-stone-300">Total Visits:</span>
                        <strong className="text-white">{item.visits}</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-sky-300">Unique Visitors:</span>
                        <strong className="text-sky-300">{item.uniqueVisitors}</strong>
                      </div>
                    </div>
                  )}

                  {/* Paired Bars */}
                  <div className="w-full flex items-end justify-center gap-[2px] h-full">
                    {/* Total Visits Bar */}
                    <div
                      style={{ height: `${visitHeight}%` }}
                      className={`w-full max-w-[14px] rounded-t transition-all ${
                        isHovered ? 'bg-stone-700 shadow-md' : 'bg-black hover:opacity-80'
                      }`}
                    />
                    {/* Unique Visitors Bar */}
                    <div
                      style={{ height: `${uniqueHeight}%` }}
                      className={`w-full max-w-[10px] rounded-t transition-all ${
                        isHovered ? 'bg-sky-400' : 'bg-sky-500/80'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[11px] text-stone-400 pt-2 px-1">
            <span>{data[0]?.label || ''}</span>
            {data.length > 10 && <span>{data[Math.floor(data.length / 2)]?.label || ''}</span>}
            <span>{data[data.length - 1]?.label || ''}</span>
          </div>
        </div>
      ) : (
        /* Data Table View */
        <div className="mt-4 overflow-x-auto max-h-72 overflow-y-auto border border-black/[0.08] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] sticky top-0 border-b border-black/[0.08] text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Total Visits</th>
                <th className="py-2.5 px-4">Unique Visitors</th>
                <th className="py-2.5 px-4">Visits / Visitor</th>
                <th className="py-2.5 px-4 text-right">Trend Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {[...data].reverse().map((item) => {
                const ratio =
                  item.uniqueVisitors > 0
                    ? (item.visits / item.uniqueVisitors).toFixed(1)
                    : item.visits > 0
                      ? '1.0'
                      : '0.0';
                const sharePercent =
                  totalVisitsInRange > 0 ? Math.round((item.visits / totalVisitsInRange) * 100) : 0;

                return (
                  <tr key={item.date} className="hover:bg-black/[0.02] transition-colors">
                    <td className="py-2.5 px-4 font-medium text-stone-900">
                      {item.date} <span className="text-stone-400 font-normal">({item.label})</span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-stone-800">
                      {item.visits.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-sky-600 font-medium">
                      {item.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">{ratio}x</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
                        {sharePercent}%
                        <span
                          className="h-1.5 rounded-full bg-black/20 inline-block ml-1"
                          style={{ width: `${Math.max(4, sharePercent * 2)}px` }}
                        />
                      </span>
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
