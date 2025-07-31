'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function PricingCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
      <Skeleton className="h-6 w-24 mb-4" />
      <Skeleton className="h-10 w-32 mb-4" />
      <Skeleton className="h-4 w-full mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, j) => (
          <div key={j} className="flex items-start gap-2">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}