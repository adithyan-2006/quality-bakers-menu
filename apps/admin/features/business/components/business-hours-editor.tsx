'use client';

import { BusinessHours, DayHours } from '../repositories/business-repo';
import { Clock, Moon } from 'lucide-react';

interface BusinessHoursEditorProps {
  value: BusinessHours;
  onChange: (value: BusinessHours) => void;
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
  const handleDayChange = (day: keyof BusinessHours, field: keyof DayHours, newVal: any) => {
    onChange({
      ...value,
      [day]: {
        ...(value[day] as DayHours),
        [field]: newVal,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/[0.08] overflow-hidden bg-white/80 backdrop-blur-md shadow-glass">
        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr_1fr_80px] gap-4 p-4 border-b border-black/[0.06] bg-black/[0.02] font-bold text-xs uppercase tracking-wider text-stone-600">
          <div>Day</div>
          <div className="hidden md:block">Opening Time</div>
          <div className="hidden md:block">Closing Time</div>
          <div className="text-right">Closed</div>
        </div>

        <div className="divide-y divide-black/[0.06]">
          {DAYS.map((day) => {
            const dayData = value[day] as DayHours;
            return (
              <div
                key={day}
                className={`grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr_1fr_80px] gap-4 p-4 items-center transition-colors ${dayData.isClosed ? 'bg-black/[0.02]' : ''}`}
              >
                <div className="font-bold capitalize text-black">{day}</div>

                <div className="flex md:contents flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-500 md:hidden" />
                    <input
                      type="time"
                      value={dayData.openTime}
                      onChange={(e) => handleDayChange(day, 'openTime', e.target.value)}
                      disabled={dayData.isClosed}
                      className="rounded-xl border border-black/[0.08] bg-white/80 text-black px-3 py-1.5 text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-stone-500 md:hidden" />
                    <input
                      type="time"
                      value={dayData.closeTime}
                      onChange={(e) => handleDayChange(day, 'closeTime', e.target.value)}
                      disabled={dayData.isClosed}
                      className="rounded-xl border border-black/[0.08] bg-white/80 text-black px-3 py-1.5 text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center self-start md:self-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={dayData.isClosed}
                      onChange={(e) => handleDayChange(day, 'isClosed', e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-black">Holiday Hours & Special Notes</label>
        <textarea
          value={value.holidayHours}
          onChange={(e) => onChange({ ...value, holidayHours: e.target.value })}
          rows={3}
          placeholder="e.g. Closed on national holidays. We close at 2 PM on Christmas Eve."
          className="w-full rounded-2xl border border-black/[0.08] bg-white/80 backdrop-blur-md px-4 py-3 text-sm text-black placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-black shadow-glass transition-all"
        />
      </div>
    </div>
  );
}
