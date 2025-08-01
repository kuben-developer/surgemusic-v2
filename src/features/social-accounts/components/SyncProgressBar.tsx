"use client"

interface SyncProgressBarProps {
  completedChecksCount: number;
  totalProfilesToSync: number;
}

export function SyncProgressBar({ completedChecksCount, totalProfilesToSync }: SyncProgressBarProps) {
  if (totalProfilesToSync === 0) return null;

  const progressPercentage = totalProfilesToSync > 0 ? (completedChecksCount / totalProfilesToSync) * 100 : 0;

  return (
    <div className="my-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Progress</span>
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
          {completedChecksCount} / {totalProfilesToSync}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-200 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}