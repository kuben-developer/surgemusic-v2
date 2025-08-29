import type { PricingPlan, PricingInterval, PlanName } from '../types/pricing.types';

/**
 * Formats a price with currency symbol
 */
export function formatPrice(price: number): string {
  return `$${price}`;
}

/**
 * Formats a price with interval
 */
export function formatPriceWithInterval(price: number, interval: PricingInterval): string {
  return `${formatPrice(price)}/${interval}`;
}

/**
 * Calculates the yearly discount percentage
 */
export function calculateYearlyDiscount(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  const discount = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
  return Math.round(discount);
}

/**
 * Gets the yearly savings amount
 */
export function getYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  return (monthlyPrice * 12) - yearlyPrice;
}

/**
 * Checks if a plan is the most popular plan
 */
export function isMostPopularPlan(planName: PlanName): boolean {
  return planName === 'Professional';
}

/**
 * Gets the plan tier order for sorting (Starter = 1, Professional = 2, Ultimate = 3)
 */
export function getPlanTier(planName: PlanName): number {
  const tierMap: Record<PlanName, number> = {
    'Starter': 1,
    'Growth': 2,
    'Professional': 3,
    'Ultimate': 4,
  };
  return tierMap[planName];
}

/**
 * Sorts plans by tier (Starter, Professional, Ultimate)
 */
export function sortPlansByTier(plans: readonly PricingPlan[]): PricingPlan[] {
  return [...plans].sort((a, b) => getPlanTier(a.name) - getPlanTier(b.name));
}

/**
 * Finds a plan by name and interval
 */
export function findPlan(
  plans: readonly PricingPlan[],
  name: PlanName,
  interval: PricingInterval
): PricingPlan | undefined {
  return plans.find(plan => plan.name === name && plan.interval === interval);
}

/**
 * Checks if a plan has a valid price ID
 */
export function isValidPlan(plan: PricingPlan): boolean {
  return Boolean(plan.priceId && plan.priceId.trim() !== '');
}

/**
 * Gets feature count for a plan
 */
export function getFeatureCount(plan: PricingPlan): number {
  return plan.features.length;
}

/**
 * Checks if the user's current plan is higher tier than the given plan
 */
export function isUserOnHigherPlan(currentPlanName: PlanName | undefined, planName: PlanName): boolean {
  if (!currentPlanName) return false;
  return getPlanTier(currentPlanName) > getPlanTier(planName);
}

/**
 * Formats video generations with proper singular/plural
 */
export function formatVideoGenerations(count: number): string {
  return `${count} video generation${count === 1 ? '' : 's'}`;
}

/**
 * Formats user profiles with proper singular/plural
 */
export function formatUserProfiles(count: number): string {
  return `${count} user profile${count === 1 ? '' : 's'}`;
}

/**
 * Gets the display name for interval with savings info
 */
export function getIntervalDisplayName(interval: PricingInterval): string {
  return interval === 'year' ? 'Yearly (Save 20%)' : 'Monthly';
}

/**
 * Validates if a checkout session can be created for a plan
 */
export function canCreateCheckoutSession(plan: PricingPlan): boolean {
  return isValidPlan(plan) && plan.price > 0;
}

/**
 * Gets a user-friendly error message for plan validation
 */
export function getPlanValidationError(plan: PricingPlan): string | null {
  if (!isValidPlan(plan)) {
    return 'This plan is not available for purchase.';
  }
  if (plan.price <= 0) {
    return 'Invalid pricing for this plan.';
  }
  return null;
}