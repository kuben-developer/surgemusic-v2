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
