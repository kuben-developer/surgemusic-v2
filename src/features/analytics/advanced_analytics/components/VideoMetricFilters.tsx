"use client";

import { Eye, TrendingUp, Target, Clock } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface VideoMetricFiltersProps {
  minViews: number | null;
  minEngRate: number | null;
  minHookScore: number | null;
  minWatchTime: number | null;
  onMinViewsChange: (value: number | null) => void;
  onMinEngRateChange: (value: number | null) => void;
  onMinHookScoreChange: (value: number | null) => void;
  onMinWatchTimeChange: (value: number | null) => void;
}

export function VideoMetricFilters({
  minViews,
  minEngRate,
  minHookScore,
  minWatchTime,
  onMinViewsChange,
  onMinEngRateChange,
  onMinHookScoreChange,
  onMinWatchTimeChange,
}: VideoMetricFiltersProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl p-4 space-y-5 shadow-xl shadow-black/5">
     

      {/* Filter Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Views Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">Min Views</label>
          </div>
          <ToggleGroup
            type="single"
            value={minViews?.toString() ?? ""}
            onValueChange={(value) => onMinViewsChange(value ? Number(value) : null)}
            className="grid grid-cols-3 gap-1.5"
          >
            <ToggleGroupItem
              value="100"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minViews === 100
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              100
            </ToggleGroupItem>
            <ToggleGroupItem
              value="250"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minViews === 250
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              250
            </ToggleGroupItem>
            <ToggleGroupItem
              value="500"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minViews === 500
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              500
            </ToggleGroupItem>
            <ToggleGroupItem
              value="1000"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minViews === 1000
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              1K
            </ToggleGroupItem>
            <ToggleGroupItem
              value="2500"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minViews === 2500
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              2.5K
            </ToggleGroupItem>
            <ToggleGroupItem
              value="5000"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minViews === 5000
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              5K
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Engagement Rate Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">Min Eng Rate</label>
          </div>
          <ToggleGroup
            type="single"
            value={minEngRate?.toString() ?? ""}
            onValueChange={(value) => onMinEngRateChange(value ? Number(value) : null)}
            className="grid grid-cols-3 gap-1.5"
          >
            <ToggleGroupItem
              value="2"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minEngRate === 2
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              2%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="5"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minEngRate === 5
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              5%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="8"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minEngRate === 8
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              8%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="12"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minEngRate === 12
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              12%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="15"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minEngRate === 15
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              15%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="20"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minEngRate === 20
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              20%
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Hook Score Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">Min Hook Score</label>
          </div>
          <ToggleGroup
            type="single"
            value={minHookScore?.toString() ?? ""}
            onValueChange={(value) => onMinHookScoreChange(value ? Number(value) : null)}
            className="grid grid-cols-3 gap-1.5"
          >
            <ToggleGroupItem
              value="5"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minHookScore === 5
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              5%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="10"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minHookScore === 10
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              10%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="15"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minHookScore === 15
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              15%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="20"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minHookScore === 20
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              20%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="25"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minHookScore === 25
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              25%
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minHookScore === 30
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              30%
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Watch Time Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">Min Watch Time</label>
          </div>
          <ToggleGroup
            type="single"
            value={minWatchTime?.toString() ?? ""}
            onValueChange={(value) => onMinWatchTimeChange(value ? Number(value) : null)}
            className="grid grid-cols-3 gap-1.5"
          >
            <ToggleGroupItem
              value="5"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minWatchTime === 5
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              5s
            </ToggleGroupItem>
            <ToggleGroupItem
              value="10"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minWatchTime === 10
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              10s
            </ToggleGroupItem>
            <ToggleGroupItem
              value="15"
              className={cn(
                "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer",
                minWatchTime === 15
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                  : "bg-muted/40 hover:bg-muted/60"
              )}
            >
              15s+
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
