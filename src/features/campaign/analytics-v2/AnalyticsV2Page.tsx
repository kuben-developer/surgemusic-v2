"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AnalyticsV2Client } from "./components/AnalyticsV2Client";

interface AnalyticsV2PageProps {
  campaignId: string;
}

export function AnalyticsV2Page({ campaignId }: AnalyticsV2PageProps) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <AnalyticsV2Client campaignId={campaignId} />
      </Suspense>
    </div>
  );
}
