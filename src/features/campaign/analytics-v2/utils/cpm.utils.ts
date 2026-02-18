/**
 * CPM (Cost Per Thousand views) Calculation Utilities
 *
 * CPM helps measure the cost efficiency of video campaigns by calculating
 * how much it costs to reach 1,000 views.
 */

const DEFAULT_CPM_MULTIPLIER = 0.5;

export interface CpmParams {
  totalViews: number;
  manualVideoCount: number;
  apiVideoCount: number;
  manualCpmMultiplier?: number;
  apiCpmMultiplier?: number;
}

/**
 * Calculate CPM (Cost Per Thousand views)
 *
 * Formula: CPM = (Total Cost / Total Views) × 1000
 * Where Total Cost = (Manual Videos × Manual Rate) + (API Videos × API Rate)
 */
export function calculateCPM(params: CpmParams): number {
  const {
    totalViews,
    manualVideoCount,
    apiVideoCount,
    manualCpmMultiplier = DEFAULT_CPM_MULTIPLIER,
    apiCpmMultiplier = DEFAULT_CPM_MULTIPLIER,
  } = params;

  // Handle edge case: no views
  if (totalViews === 0) return 0;

  const totalCost =
    manualVideoCount * manualCpmMultiplier + apiVideoCount * apiCpmMultiplier;
  const cpm = (totalCost / totalViews) * 1000;

  return cpm;
}

/**
 * Format CPM value as currency string
 */
export function formatCPM(cpm: number, currency: "USD" | "GBP" = "USD"): string {
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${cpm.toFixed(2)}`;
}
