'use client';

import { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { monthlyPlans, yearlyPlans } from '../constants/plans.constants';
import type { PricingInterval, UsePricingPlansReturn } from '../types/pricing.types';

/**
 * Hook for managing pricing plans state and user subscription data
 */
export function usePricingPlans(): UsePricingPlansReturn {
  const [interval, setInterval] = useState<PricingInterval>('month');
  const user = useQuery(api.users.getCurrentUser);
  const isLoading = user === undefined;

  // Auto-select interval based on user's current subscription
  useEffect(() => {
    if (user?.subscriptionPriceId) {
      try {
        const isYearlyPlan = yearlyPlans.some(plan => plan.priceId === user.subscriptionPriceId);
        setInterval(isYearlyPlan ? 'year' : 'month');
      } catch (error) {
        // Fallback to monthly if there's any error
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error determining subscription interval:', error);
        }
        setInterval('month');
      }
    }
  }, [user?.subscriptionPriceId]);

  // Get current plans based on selected interval
  const plans = interval === 'month' ? monthlyPlans : yearlyPlans;
  
  // Find user's current plan
  const currentPlan = user?.subscriptionPriceId 
    ? plans.find(plan => plan.priceId === user.subscriptionPriceId)
    : undefined;
  
  // Derive user subscription state
  const hasActivePlan = Boolean(user?.subscriptionPriceId);
  const isUserOnTrial = Boolean(user?.isTrial);
  const isFirstTimeUser = Boolean(user?.firstTimeUser);

  return {
    user,
    isLoading,
    interval,
    setInterval,
    plans,
    currentPlan,
    hasActivePlan,
    isUserOnTrial,
    isFirstTimeUser,
  };
}