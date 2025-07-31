'use client';

import { Button } from '@/components/ui/button';
import { Zap, Loader2 } from 'lucide-react';
import type { PricingPlan } from '../types/pricing.types';

interface TrialBannerProps {
  currentPlan: PricingPlan | undefined;
  onConvertToPaid: () => void;
  isLoading: boolean;
}

export function TrialBanner({ currentPlan, onConvertToPaid, isLoading }: TrialBannerProps) {
  return (
    <div className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Trial Period Active</h3>
            <p className="text-sm text-muted-foreground">
              You're currently on a trial of our {currentPlan?.name} plan. Convert to a paid plan to keep your benefits.
            </p>
          </div>
        </div>
        <Button
          onClick={onConvertToPaid}
          className="whitespace-nowrap"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Convert to Paid Plan"
          )}
        </Button>
      </div>
    </div>
  );
}