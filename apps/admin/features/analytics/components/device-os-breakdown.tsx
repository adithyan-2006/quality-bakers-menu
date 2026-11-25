'use client';

import * as React from 'react';
import { DeviceBreakdown, DeviceModelStat, BrowserStat, OSStat } from '@qbm/types';
import { Smartphone, Monitor, Tablet, Compass, Laptop, Cpu, ShieldCheck } from 'lucide-react';

interface DeviceOSBreakdownProps {
  devices: DeviceBreakdown;
  topDevices?: DeviceModelStat[];
  browsers: BrowserStat[];
  operatingSystems: OSStat[];
}

export function DeviceOSBreakdown({
  devices,
  topDevices = [],
  browsers,
  operatingSystems,
}: DeviceOSBreakdownProps) {
  const totalDeviceVisits = devices.desktop + devices.mobile + devices.tablet + devices.other;
  const totalUniqueDevices =
    devices.totalUniqueDevices ||
    devices.uniqueDesktop + devices.uniqueMobile + devices.uniqueTablet + devices.uniqueOther;

  const getVisitPercent = (val: number) =>
    totalDeviceVisits > 0 ? Math.round((val / totalDeviceVisits) * 100) : 0;

  const getUniquePercent = (val: number) =>
    totalUniqueDevices > 0 ? Math.round((val / totalUniqueDevices) * 100) : 0;

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-black" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-black" />;
      case 'desktop':
        return <Monitor className="w-4 h-4 text-black" />;
      default:
        return <Laptop className="w-4 h-4 text-black" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Device Categories & Specific Device Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Device Categories (Unique Devices vs Total Pageviews) */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
            <div>
              <h3 className="text-base font-bold text-black tracking-tight">Device Categories</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Breakdown by device form-factor with distinct unique hardware counts
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {totalUniqueDevices} Unique {totalUniqueDevices === 1 ? 'Device' : 'Devices'}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {/* Mobile */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 font-bold text-black">
                  <Smartphone className="w-4 h-4 text-black" />
                  <span>Mobile Phones</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/[0.04] text-black border border-black/[0.08]">
                    {devices.uniqueMobile} unique{' '}
                    {devices.uniqueMobile === 1 ? 'device' : 'devices'}
                  </span>
                  <span className="text-stone-600 font-semibold text-xs">
                    {devices.mobile.toLocaleString()} visits ({getVisitPercent(devices.mobile)}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${getUniquePercent(devices.uniqueMobile)}%` }}
                />
              </div>
            </div>

            {/* Desktop */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 font-bold text-black">
                  <Monitor className="w-4 h-4 text-black" />
                  <span>Desktop Computers</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/[0.04] text-black border border-black/[0.08]">
                    {devices.uniqueDesktop} unique{' '}
                    {devices.uniqueDesktop === 1 ? 'device' : 'devices'}
                  </span>
                  <span className="text-stone-600 font-semibold text-xs">
                    {devices.desktop.toLocaleString()} visits ({getVisitPercent(devices.desktop)}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${getUniquePercent(devices.uniqueDesktop)}%` }}
                />
              </div>
            </div>

            {/* Tablet */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 font-bold text-black">
                  <Tablet className="w-4 h-4 text-black" />
                  <span>Tablets</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/[0.04] text-black border border-black/[0.08]">
                    {devices.uniqueTablet} unique{' '}
                    {devices.uniqueTablet === 1 ? 'device' : 'devices'}
                  </span>
                  <span className="text-stone-600 font-semibold text-xs">
                    {devices.tablet.toLocaleString()} visits ({getVisitPercent(devices.tablet)}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${getUniquePercent(devices.uniqueTablet)}%` }}
                />
              </div>
            </div>

            {/* Other */}
            {devices.other > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-2 font-bold text-black">
                    <Laptop className="w-4 h-4 text-black" />
                    <span>Other Devices</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/[0.04] text-black border border-black/[0.08]">
                      {devices.uniqueOther} unique
                    </span>
                    <span className="text-stone-600 font-semibold text-xs">
                      {devices.other.toLocaleString()} visits ({getVisitPercent(devices.other)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-500"
                    style={{ width: `${getUniquePercent(devices.uniqueOther)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Detected Device Models & Names */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
            <div>
              <h3 className="text-base font-bold text-black tracking-tight flex items-center gap-2">
                <span>Detected Device Models</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black text-white">
                  {topDevices.length}
                </span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Specific hardware models identified from client metadata & user-agents
              </p>
            </div>
            <div className="p-2.5 bg-black/[0.04] text-black border border-black/[0.06] rounded-xl">
              <Cpu className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {topDevices.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No device models detected yet
              </div>
            ) : (
              topDevices.map((dev) => (
                <div key={dev.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-lg bg-black/[0.04] border border-black/[0.06] shrink-0">
                        {getDeviceIcon(dev.deviceType)}
                      </div>
                      <span className="font-bold text-black truncate">{dev.name}</span>
                      <span className="capitalize text-[10px] font-semibold text-stone-500 border border-black/[0.08] rounded-full px-2 py-0.5">
                        {dev.deviceType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/[0.04] text-black border border-black/[0.08]">
                        {dev.uniqueDevices} {dev.uniqueDevices === 1 ? 'device' : 'devices'}
                      </span>
                      <span className="text-stone-500 font-medium text-[11px]">
                        {dev.visits.toLocaleString()} visits
                      </span>
                      <span className="text-[11px] font-bold text-black min-w-[32px] text-right">
                        {dev.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, dev.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Browsers & Operating Systems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Browsers */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <h3 className="text-base font-bold text-black tracking-tight">Top Web Browsers</h3>
            <Compass className="w-4 h-4 text-stone-400" />
          </div>

          <div className="mt-4 space-y-3.5">
            {browsers.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">No browser data yet</div>
            ) : (
              browsers.map((b) => (
                <div key={b.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-black">{b.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-medium">
                        {b.visits.toLocaleString()} visits
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/[0.04] text-black border border-black/[0.08] font-bold text-[10px]">
                        {b.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(3, b.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Operating Systems */}
        <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 shadow-glass">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <h3 className="text-base font-bold text-black tracking-tight">Operating Systems</h3>
            <Laptop className="w-4 h-4 text-stone-400" />
          </div>

          <div className="mt-4 space-y-3.5">
            {operatingSystems.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">No OS data yet</div>
            ) : (
              operatingSystems.map((os) => (
                <div key={os.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-black">{os.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-medium">
                        {os.visits.toLocaleString()} visits
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/[0.04] text-black border border-black/[0.08] font-bold text-[10px]">
                        {os.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(3, os.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
