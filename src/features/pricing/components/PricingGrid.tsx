'use client';

import { PricingCard } from './PricingCard';
import type { PricingPlan } from '../types/pricing.types';

interface PricingGridProps {
  plans: PricingPlan[];
  currentPlan: PricingPlan | undefined;
  hasActivePlan: boolean;
  isUserOnTrial: boolean;
  isFirstTimeUser: boolean;
  onSelectPlan: (plan: PricingPlan) => void;
  onBuyNow: (plan: PricingPlan) => void;
  onManageBilling: () => void;
}

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