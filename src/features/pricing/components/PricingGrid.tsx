'use client';

import { PricingCard } from './PricingCard';
import type { PricingGridProps } from '../types/pricing.types';

export function PricingGrid({
  plans,
  currentPlan,
  hasActivePlan,
  isUserOnTrial,
  isFirstTimeUser,
  onSelectPlan,
  onBuyNow,
  onManageBilling,
}: PricingGridProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <PricingCard
          key={plan.name}
          plan={plan}
          isCurrentPlan={plan.priceId === currentPlan?.priceId}
          hasActivePlan={hasActivePlan}
          isUserOnTrial={isUserOnTrial}
          isFirstTimeUser={isFirstTimeUser}
          onSelectPlan={onSelectPlan}
          onBuyNow={onBuyNow}
          onManageBilling={onManageBilling}
        />
      ))}
    </div>
  );
}