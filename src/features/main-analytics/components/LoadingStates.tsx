interface LoadingStatesProps {
  type?: 'content' | 'page';
}

/**
 * Reusable loading state components for the analytics feature
 */
export function LoadingStates({ type = 'content' }: LoadingStatesProps) {
  if (type === 'page') {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-muted rounded" />
          <div className="flex justify-between gap-4">
            <div className="h-10 w-[300px] bg-muted rounded" />
            <div className="flex gap-4">
              <div className="h-10 w-[180px] bg-muted rounded" />
              <div className="h-10 w-36 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[500px] bg-muted rounded-lg" />
            <div className="h-[500px] bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
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