'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PricingCardActions } from './PricingCardActions';
import { isMostPopularPlan, isUserOnHigherPlan } from '../utils/pricing.utils';
import type { PricingCardProps } from '../types/pricing.types';

export function PricingCard({
  plan,
  currentPlan,
  isCurrentPlan,
  hasActivePlan,
  isUserOnTrial,
  isFirstTimeUser,
  onSelectPlan,
  onBuyNow,
  onManageBilling,
}: PricingCardProps) {
  const showPopularBadge =
    isMostPopularPlan(plan.name) &&
    !isCurrentPlan &&
    !isUserOnHigherPlan(currentPlan?.name, plan.name);
  const showCurrentBadge = isCurrentPlan;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-8 shadow-lg",
        showPopularBadge && "ring-2 ring-primary",
        isCurrentPlan && "ring-2 ring-green-500"
      )}
    >
      {/* Status badges */}
      {showPopularBadge && (
        <div className="mb-4 -mt-2">
          <StatusBadge type="popular" text="Most Popular" />
        </div>
      )}
      {showCurrentBadge && (
        <div className="mb-4 -mt-2">
          <StatusBadge
            type={isUserOnTrial ? "trial" : "current"}
            text={isUserOnTrial ? "Current Trial Plan" : "Current Plan"}
          />
        </div>
      )}

      {/* Plan header */}
      <h3 className="text-xl font-semibold text-card-foreground">{plan.name}</h3>
      <div className="mt-4 flex items-baseline text-card-foreground">
        <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
        <span className="ml-1 text-xl font-semibold">/{plan.interval}</span>
      </div>
      <p className="mt-4 text-muted-foreground">{plan.description}</p>

      {/* Action buttons */}
      <PricingCardActions
        plan={plan}
        isCurrentPlan={isCurrentPlan}
        hasActivePlan={hasActivePlan}
        isUserOnTrial={isUserOnTrial}
        isFirstTimeUser={isFirstTimeUser}
        onSelectPlan={onSelectPlan}
        onBuyNow={onBuyNow}
        onManageBilling={onManageBilling}
      />

      {/* Features list */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-card-foreground">What's Included</h4>
        <ul className="mt-4 space-y-4">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex items-start">
              {feature.trim().startsWith("-") ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <span className="text-sm text-muted-foreground/60 line-through">{feature.replace("-", "")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}