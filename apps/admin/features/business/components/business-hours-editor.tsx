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
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900">
        <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr_1fr_80px] gap-4 p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 font-medium text-sm text-stone-500">
          <div>Day</div>
          <div className="hidden md:block">Opening Time</div>
          <div className="hidden md:block">Closing Time</div>
          <div className="text-right">Closed</div>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
          {DAYS.map((day) => {
            const dayData = value[day] as DayHours;
            return (
              <div
                key={day}
                className={`grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] md:grid-cols-[140px_1fr_1fr_80px] gap-4 p-4 items-center transition-colors ${dayData.isClosed ? 'bg-stone-50/50 dark:bg-stone-950/30' : ''}`}
              >
                <div className="font-medium capitalize text-stone-900 dark:text-stone-50">
                  {day}
                </div>

                <div className="flex md:contents flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-400 md:hidden" />
                    <input
                      type="time"
                      value={dayData.openTime}
                      onChange={(e) => handleDayChange(day, 'openTime', e.target.value)}
                      disabled={dayData.isClosed}
                      className="rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-1.5 text-sm disabled:opacity-40"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-stone-400 md:hidden" />
                    <input
                      type="time"
                      value={dayData.closeTime}
                      onChange={(e) => handleDayChange(day, 'closeTime', e.target.value)}
                      disabled={dayData.isClosed}
                      className="rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-1.5 text-sm disabled:opacity-40"
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
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-stone-600 peer-checked:bg-rose-500"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Holiday Hours & Special Notes</label>
        <textarea
          value={value.holidayHours}
          onChange={(e) => onChange({ ...value, holidayHours: e.target.value })}
          rows={3}
          placeholder="e.g. Closed on national holidays. We close at 2 PM on Christmas Eve."
          className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm resize-none"
        />
      </div>
    </div>
  );
}
