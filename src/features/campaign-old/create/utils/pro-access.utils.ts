/**
 * Checks if a user has access to Pro features
 * Pro features are available to:
 * 1. Users on free trial
 * 2. Users with Growth, Professional, or Ultimate plans (NOT Starter)
 */
export function hasProAccess(subscriptionPriceId: string | undefined, isTrial: boolean): boolean {
  // Free trial users have Pro access
  if (isTrial) {
    return true;
  }
  
  // No subscription means no Pro access
  if (!subscriptionPriceId) {
    return false;
  }
  
  // List of Starter plan price IDs (monthly and yearly)
  const STARTER_PRICE_IDS = [
    process.env.NEXT_PUBLIC_STRIPE_STARTER_M_PRICE,
    process.env.NEXT_PUBLIC_STRIPE_STARTER_Y_PRICE,
  ];
  
  // If the subscription is NOT a Starter plan, then user has Pro access
  // (i.e., they have Growth, Professional, or Ultimate plan)
  return !STARTER_PRICE_IDS.includes(subscriptionPriceId);
}