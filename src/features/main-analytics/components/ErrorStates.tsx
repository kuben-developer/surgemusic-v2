import { Button } from "@/components/ui/button";

interface ErrorStatesProps {
  error?: Error | null;
  onRetry?: () => void;
  type?: 'error' | 'no-data';
}

/**
 * Reusable error and empty state components for the analytics feature
 */
export function ErrorStates({ error, onRetry, type = 'error' }: ErrorStatesProps) {
  if (type === 'no-data') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">No Analytics Data</h1>
        <p className="text-muted-foreground mb-4">
          No data available for the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-2">Analytics Temporarily Unavailable</h1>
      <p className="text-muted-foreground mb-4">
        {error?.message || "Could not load analytics data at this time."}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}