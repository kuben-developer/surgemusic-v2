/**
 * CPM (Cost Per Thousand views) Calculation Utilities
 *
 * CPM helps measure the cost efficiency of video campaigns by calculating
 * how much it costs to reach 1,000 views.
 */

const COST_PER_VIDEO = 0.50;

/**
 * Calculate CPM (Cost Per Thousand views)
 *
 * Formula: CPM = (Total Cost / Total Views) × 1000
 * Where Total Cost = Number of Videos × $0.50
 *
 * @param totalViews - Total number of views across all videos
 * @param numberOfVideos - Total number of videos in the campaign
 * @returns CPM value (cost per thousand views)
 *
 * @example
 * // 20 videos, 50,000 views
 * calculateCPM(50000, 20) // Returns 0.20 ($0.20 per 1,000 views)
 */
export function calculateCPM(totalViews: number, numberOfVideos: number): number {
  // Handle edge case: no views
  if (totalViews === 0) return 0;

  const totalCost = numberOfVideos * COST_PER_VIDEO;
  const cpm = (totalCost / totalViews) * 1000;

  return cpm;
}

/**
 * Format CPM value as currency string
 *
 * @param cpm - CPM value to format
 * @param currency - Currency symbol to use (USD or GBP)
 * @returns Formatted string (e.g., "$0.23" or "£0.23")
 */
export function formatCPM(cpm: number, currency: "USD" | "GBP" = "USD"): string {
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${cpm.toFixed(2)}`;
}

/**
 * Get the cost per video constant
 */
export function getCostPerVideo(): number {
  return COST_PER_VIDEO;
}
