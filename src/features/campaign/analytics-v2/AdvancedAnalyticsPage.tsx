"use client";

import { Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdvancedAnalyticsSection } from "./components/AdvancedAnalyticsSection";

interface AdvancedAnalyticsPageProps {
  campaignId: string;
}

export function AdvancedAnalyticsPage({
  campaignId,
}: AdvancedAnalyticsPageProps) {
  return (
    <div className="container py-8">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/campaign/${campaignId}/analytics-v2`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Advanced Analytics
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <AdvancedAnalyticsSection campaignId={campaignId} />
        </Suspense>
      </div>
    </div>
  );
}
