import { useState, useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { monthlyPlans, yearlyPlans } from '../constants/plans.constants';
import type { PricingInterval, PricingPlan } from '../types/pricing.types';

export function usePricingPlans() {
  const [interval, setInterval] = useState<PricingInterval>('month');
  const user = useQuery(api.users.getCurrentUser);
  const isLoading = user === undefined;

  useEffect(() => {
    if (user?.subscriptionPriceId) {
      const isYearlyPlan = yearlyPlans.some(plan => plan.priceId === user.subscriptionPriceId);
      setInterval(isYearlyPlan ? 'year' : 'month');
    }
  }, [user]);

  const plans = interval === 'month' ? monthlyPlans : yearlyPlans;
  const currentPlan = plans.find(plan => plan.priceId === user?.subscriptionPriceId);
  const hasActivePlan = !!user?.subscriptionPriceId;
  const isUserOnTrial = user?.isTrial || false;
  const isFirstTimeUser = user?.firstTimeUser || false;

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