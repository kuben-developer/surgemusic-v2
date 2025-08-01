'use client';

import { Button } from '@/components/ui/button';
import type { PricingPlan } from '../types/pricing.types';

interface PricingCardActionsProps {
  readonly plan: PricingPlan;
  readonly isCurrentPlan: boolean;
  readonly hasActivePlan: boolean;
  readonly isUserOnTrial: boolean;
  readonly isFirstTimeUser: boolean;
  readonly onSelectPlan: (plan: PricingPlan) => void;
  readonly onBuyNow: (plan: PricingPlan) => void;
  readonly onManageBilling: () => void;
}

export function PricingCardActions({
  plan,
  isCurrentPlan,
  hasActivePlan,
  isUserOnTrial,
  isFirstTimeUser,
  onSelectPlan,
  onBuyNow,
  onManageBilling,
}: PricingCardActionsProps) {
  const getMainButtonText = (): string => {
    if (isCurrentPlan) {
      return isUserOnTrial ? 'Current Trial Plan' : 'Current Plan';
    }
    if (hasActivePlan) {
      return 'Switch Plan';
    }
    return 'Buy Now';
  };

  const handleMainButtonClick = (): void => {
    if (isCurrentPlan) {
      onManageBilling();
    } else {
      onBuyNow(plan);
    }
  };

  return (
    <div className="mt-8 space-y-3">
      {isFirstTimeUser && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onSelectPlan(plan)}
        >
          Try Free for 3 Days
        </Button>
      )}
      <Button
        className="w-full"
        onClick={handleMainButtonClick}
        disabled={plan.priceId === ''}
      >
        {getMainButtonText()}
      </Button>
    </div>
  );
}