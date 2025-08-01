import type { User } from "../types/credits.types";

/**
 * Calculate the total available credits for a user
 * @param user - The user object containing credit information
 * @returns The total number of credits available
 */
export function calculateTotalCredits(user: User): number {
  return user.videoGenerationCredit + user.videoGenerationAdditionalCredit;
}

/**
 * Check if user has sufficient credits for a specific number of videos
 * @param user - The user object containing credit information
 * @param requiredCredits - Number of credits required
 * @returns Boolean indicating if user has sufficient credits
 */
export function hasSufficientCredits(user: User, requiredCredits: number): boolean {
  return calculateTotalCredits(user) >= requiredCredits;
}

/**
 * Format credits display text
 * @param credits - Number of credits to format
 * @returns Formatted string for display
 */
export function formatCreditsText(credits: number): string {
  if (credits === 0) return "No credits";
  if (credits === 1) return "1 credit";
  return `${credits} credits`;
}

/**
 * Check if a user has an active subscription (not trial)
 * @param user - The user object containing subscription information
 * @returns Boolean indicating if user has active subscription
 */
export function hasActiveSubscription(user: User): boolean {
  return !!user.subscriptionPriceId && !user.isTrial;
}