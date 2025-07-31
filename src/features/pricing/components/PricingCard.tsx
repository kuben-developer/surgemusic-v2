'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import type { PricingCardProps } from '../types/pricing.types';

export function PricingCard({
  plan,
  isCurrentPlan,
  hasActivePlan,
  isUserOnTrial,
  isFirstTimeUser,
  onSelectPlan,
  onBuyNow,
  onManageBilling,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-8 shadow-lg",
        plan.name === 'Professional' && "ring-2 ring-primary",
        isCurrentPlan && "ring-2 ring-green-500"
      )}
    >
      {plan.name === 'Professional' && (
        <div className="mb-4 -mt-2">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      {isCurrentPlan && (
        <div className="mb-4 -mt-2">
          <span className="inline-block bg-green-500/10 text-green-500 text-xs font-semibold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-card-foreground">{plan.name}</h3>
      <div className="mt-4 flex items-baseline text-card-foreground">
        <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
        <span className="ml-1 text-xl font-semibold">/{plan.interval}</span>
      </div>
      <p className="mt-4 text-muted-foreground">{plan.description}</p>

      <div className="mt-8 space-y-3">
        {!isFirstTimeUser ? null : (
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
          onClick={() => {
            if (isCurrentPlan) {
              onManageBilling();
            } else {
              onBuyNow(plan);
            }
          }}
          disabled={plan.priceId === ''}
        >
          {isCurrentPlan
            ? isUserOnTrial
              ? 'Current Trial Plan'
              : 'Current Plan'
            : hasActivePlan
              ? 'Switch Plan'
              : 'Buy Now'}
        </Button>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-semibold text-card-foreground">What's Included</h4>
        <ul className="mt-4 space-y-4">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex items-start">
              <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}