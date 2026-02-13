/**
 * Format a number in compact form (e.g., 1.2M, 3.5K)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return value.toString();
}

/**
 * Format a snapshotAt number (YYYYMMDDHH) into a readable date label
 */
export function formatSnapshotLabel(snapshotAt: number): string {
  const str = snapshotAt.toString().padStart(10, "0");
  const year = parseInt(str.slice(0, 4), 10);
  const month = parseInt(str.slice(4, 6), 10);
  const day = parseInt(str.slice(6, 8), 10);
  const hour = parseInt(str.slice(8, 10), 10);

  const date = new Date(Date.UTC(year, month - 1, day, hour));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    hour12: true,
  });
}

/**
 * Format a snapshotAt number into a short date (e.g., "Jan 5")
 */
export function formatSnapshotDate(snapshotAt: number): string {
  const str = snapshotAt.toString().padStart(10, "0");
  const year = parseInt(str.slice(0, 4), 10);
  const month = parseInt(str.slice(4, 6), 10);
  const day = parseInt(str.slice(6, 8), 10);

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
