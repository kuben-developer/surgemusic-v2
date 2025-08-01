'use client';

import type { DateRangeSelectorProps } from '../types';

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="mt-2 sm:mt-0 inline-flex items-center rounded-md border px-3 py-1 text-sm">
      <span className="mr-2 text-muted-foreground">Time Range:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none"
      >
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
    </div>
  );
}