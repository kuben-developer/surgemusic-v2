"use client";

import { useState } from "react";
import {
  RefreshCw,
  BarChart3,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DimensionStatsTable } from "./DimensionStatsTable";
import {
  useAdvancedAnalyticsV2,
  type DimensionType,
} from "../hooks/useAdvancedAnalyticsV2";

interface AdvancedAnalyticsSectionProps {
  campaignId: string;
}

const DIMENSION_TABS: Array<{
  value: DimensionType;
  label: string;
  dimensionLabel: string;
}> = [
  { value: "caption", label: "Caption Performance", dimensionLabel: "Caption" },
  { value: "folder", label: "Folder Performance", dimensionLabel: "Folder" },
  {
    value: "overlayStyle",
    label: "Overlay Style",
    dimensionLabel: "Overlay Style",
  },
];

export function AdvancedAnalyticsSection({
  campaignId,
}: AdvancedAnalyticsSectionProps) {
  const [activeDimension, setActiveDimension] =
    useState<DimensionType>("caption");

  const {
    stats,
    isLoading,
    lastUpdated,
    totalLinked,
    totalUnlinked,
    handleRefresh,
  } = useAdvancedAnalyticsV2(campaignId, activeDimension);

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Never";

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Advanced Analytics
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3" />
            <span>
              {totalLinked} linked
              {totalUnlinked > 0 && ` / ${totalUnlinked} pending`}
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            Updated: {lastUpdatedLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
        <Tabs
          value={activeDimension}
          onValueChange={(v) => setActiveDimension(v as DimensionType)}
        >
          <div className="flex items-center justify-between gap-4">
            <TabsList className="h-8">
              {DIMENSION_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs px-3 h-7"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-7 text-xs gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>

          {DIMENSION_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <DimensionStatsTable
                stats={stats}
                isLoading={isLoading}
                dimensionLabel={tab.dimensionLabel}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
