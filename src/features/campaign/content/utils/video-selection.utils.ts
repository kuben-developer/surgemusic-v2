import type { MontagerVideo } from "../../shared/types/campaign.types";

/**
 * Randomly selects N videos from an array of montager videos
 * Uses Fisher-Yates shuffle for fair randomization
 *
 * @param videos - Array of montager videos to select from
 * @param count - Number of videos to select
 * @returns Array of randomly selected videos
 */
export function selectRandomVideos(
  videos: MontagerVideo[],
  count: number
): MontagerVideo[] {
  if (count <= 0) {
    return [];
  }

  if (count >= videos.length) {
    return [...videos];
  }

  // Create a copy to avoid mutating the original array
  const shuffled = [...videos];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp!;
  }

  // Return first N elements
  return shuffled.slice(0, count);
}

/**
 * Validates if a montager folder has enough videos for the required count
 *
 * @param availableCount - Number of videos available in the folder
 * @param requiredCount - Number of videos needed
 * @returns Object with validation result and message
 */
export function validateVideoCount(
  availableCount: number,
  requiredCount: number
): { isValid: boolean; message?: string } {
  if (availableCount === 0) {
    return {
      isValid: false,
      message: "This folder contains no videos",
    };
  }

  if (availableCount < requiredCount) {
    return {
      isValid: false,
      message: `This folder only has ${availableCount} video${
        availableCount === 1 ? "" : "s"
      }, but ${requiredCount} ${requiredCount === 1 ? "is" : "are"} needed`,
    };
  }

  return { isValid: true };
}
