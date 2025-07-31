'use client';

import { cn } from '@/lib/utils';
import type { PricingInterval } from '../types/pricing.types';

interface PricingToggleProps {
  interval: PricingInterval;
  onIntervalChange: (interval: PricingInterval) => void;
}

export function PricingToggle({ interval, onIntervalChange }: PricingToggleProps) {
  return (
    <div className="mb-12 text-center">
      <div className="inline-flex items-center rounded-full border border-border p-1 bg-background">
        <button
          onClick={() => onIntervalChange('month')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            interval === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => onIntervalChange('year')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            interval === 'year' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Yearly (Save 20%)
        </button>
      </div>
    </div>
  );
}