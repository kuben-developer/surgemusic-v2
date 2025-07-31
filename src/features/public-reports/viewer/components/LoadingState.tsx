import { RefreshCw } from 'lucide-react';
import type { LoadingStateProps } from '../../shared/types';

export function LoadingState({ isRefetching = false }: LoadingStateProps) {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-center space-x-3 py-4">
        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        <span className="text-lg">
          {isRefetching ? "Refreshing report data..." : "Loading shared report..."}
        </span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-muted rounded-lg w-1/3"></div>
        <div className="h-8 bg-muted rounded-lg w-1/4"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[500px] bg-muted rounded-lg" />
        <div className="h-[500px] bg-muted rounded-lg" />
      </div>
    </div>
  );
}