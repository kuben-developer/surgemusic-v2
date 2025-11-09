import type {
  AirtableContent,
  VideoCategoryStats,
  NicheStats,
} from "../types/campaign.types";

/**
 * Group content by video_category and calculate stats
 */
export function calculateCategoryStats(
  content: AirtableContent[]
): VideoCategoryStats[] {
  const categoryMap = new Map<string, { total: number; withUrl: number }>();

  content.forEach((item) => {
    const category = item.video_category || "Uncategorized";
    const existing = categoryMap.get(category) || { total: 0, withUrl: 0 };

    existing.total += 1;
    if (item.video_url) {
      existing.withUrl += 1;
    }

    categoryMap.set(category, existing);
  });

  return Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      totalCount: stats.total,
      withUrlCount: stats.withUrl,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Filter content by video category
 */
export function filterByCategory(
  content: AirtableContent[],
  category: string
): AirtableContent[] {
  return content.filter((item) => item.video_category === category);
}

/**
 * Calculate niche stats for a specific category
 */
export function calculateNicheStats(
  content: AirtableContent[],
  category: string
): NicheStats[] {
  const categoryContent = filterByCategory(content, category);
  const nicheMap = new Map<string, { total: number; withUrl: number }>();

  categoryContent.forEach((item) => {
    const niche = item.account_niche || "Uncategorized";
    const existing = nicheMap.get(niche) || { total: 0, withUrl: 0 };

    existing.total += 1;
    if (item.video_url) {
      existing.withUrl += 1;
    }

    nicheMap.set(niche, existing);
  });

  return Array.from(nicheMap.entries())
    .map(([niche, stats]) => ({
      niche,
      totalCount: stats.total,
      withUrlCount: stats.withUrl,
    }))
    .sort((a, b) => a.niche.localeCompare(b.niche));
}

/**
 * Filter content by category and niche
 */
export function filterByCategoryAndNiche(
  content: AirtableContent[],
  category: string,
  niche: string | null
): AirtableContent[] {
  let filtered = filterByCategory(content, category);

  if (niche && niche !== "all") {
    filtered = filtered.filter((item) => item.account_niche === niche);
  }

  return filtered;
}

/**
 * Get unique niches for a category
 */
export function getUniqueNiches(
  content: AirtableContent[],
  category: string
): string[] {
  const categoryContent = filterByCategory(content, category);
  const niches = new Set<string>();

  categoryContent.forEach((item) => {
    if (item.account_niche) {
      niches.add(item.account_niche);
    }
  });

  return Array.from(niches).sort();
}

/**
 * Count videos with URLs in a specific category and niche
 */
export function countVideosWithUrls(
  content: AirtableContent[],
  category: string,
  niche: string | null
): { withUrl: number; total: number } {
  const filtered = filterByCategoryAndNiche(content, category, niche);

  return {
    withUrl: filtered.filter((item) => item.video_url).length,
    total: filtered.length,
  };
}
