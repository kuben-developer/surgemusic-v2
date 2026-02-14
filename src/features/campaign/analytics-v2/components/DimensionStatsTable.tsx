"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "../utils/format.utils";

interface DimensionStatRow {
  _id: string;
  dimensionValue: string;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  avgViews: number;
  avgLikes: number;
}

interface DimensionStatsTableProps {
  stats: DimensionStatRow[];
  isLoading: boolean;
  dimensionLabel: string;
}

type SortField =
  | "totalViews"
  | "totalVideos"
  | "avgViews"
  | "totalLikes"
  | "engRate";

type SortDirection = "asc" | "desc";

function computeEngRate(row: DimensionStatRow): number {
  if (row.totalViews === 0) return 0;
  return ((row.totalLikes + row.totalComments) / row.totalViews) * 100;
}

// 5-segment bar thresholds matching VideoTableRow pattern
function getViewsBars(views: number, maxViews: number): number {
  if (maxViews === 0) return 0;
  const ratio = views / maxViews;
  if (ratio >= 0.8) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

function getEngagementBars(rate: number): number {
  if (rate >= 12) return 5;
  if (rate >= 9) return 4;
  if (rate >= 6) return 3;
  if (rate >= 3) return 2;
  return 1;
}

// Color based on how many bars filled (matches VideoTableRow.getBarColor)
function getBarColor(index: number, filledBars: number): string {
  if (index >= filledBars) return "bg-muted/40";
  if (filledBars === 5) return "bg-emerald-500";
  if (filledBars === 4) return "bg-blue-500";
  if (filledBars === 3) return "bg-amber-500";
  if (filledBars === 2) return "bg-orange-500";
  return "bg-red-500";
}

export function DimensionStatsTable({
  stats,
  isLoading,
  dimensionLabel,
}: DimensionStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>("totalViews");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortField === "engRate") {
        aVal = computeEngRate(a);
        bVal = computeEngRate(b);
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [stats, sortField, sortDirection]);

  const maxViews = useMemo(
    () => Math.max(1, ...stats.map((s) => s.totalViews)),
    [stats],
  );

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-foreground">No data available</p>
        <p className="text-xs text-muted-foreground mt-1">
          Dimension stats will appear after the linking and computation crons
          have run.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/5">
      <div className="overflow-auto max-h-[700px]">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
            <tr className="border-b border-border/40">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground tracking-wider w-8">
                #
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground tracking-wider min-w-[180px]">
                {dimensionLabel}
              </th>
              <SortableHeader
                label="Videos"
                field="totalVideos"
                currentField={sortField}
                onToggle={toggleSort}
                renderIcon={renderSortIcon}
              />
              <SortableHeader
                label="Total Views"
                field="totalViews"
                currentField={sortField}
                onToggle={toggleSort}
                renderIcon={renderSortIcon}
              />
              <SortableHeader
                label="Avg Views"
                field="avgViews"
                currentField={sortField}
                onToggle={toggleSort}
                renderIcon={renderSortIcon}
              />
              <SortableHeader
                label="Total Likes"
                field="totalLikes"
                currentField={sortField}
                onToggle={toggleSort}
                renderIcon={renderSortIcon}
              />
              <SortableHeader
                label="Eng Rate"
                field="engRate"
                currentField={sortField}
                onToggle={toggleSort}
                renderIcon={renderSortIcon}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {sortedStats.map((row, index) => {
              const engRate = computeEngRate(row);
              const viewsBars = getViewsBars(row.totalViews, maxViews);
              const engBars = getEngagementBars(engRate);

              return (
                <tr
                  key={row._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {/* Rank */}
                  <td className="px-3 py-3 text-xs text-muted-foreground/60 font-mono">
                    {index + 1}
                  </td>

                  {/* Dimension Value */}
                  <td className="px-3 py-3">
                    <div className="max-w-[250px] truncate text-sm font-medium text-foreground">
                      {row.dimensionValue}
                    </div>
                  </td>

                  {/* Videos Count */}
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm font-mono font-semibold tabular-nums">
                      {row.totalVideos}
                    </span>
                  </td>

                  {/* Total Views - number on top, 5-segment bar below */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-mono font-semibold tabular-nums">
                        {formatCompactNumber(row.totalViews)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 w-3 rounded-full",
                              getBarColor(i, viewsBars),
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Avg Views */}
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm font-mono font-medium tabular-nums">
                      {formatCompactNumber(row.avgViews)}
                    </span>
                  </td>

                  {/* Total Likes */}
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm font-mono font-medium tabular-nums">
                      {formatCompactNumber(row.totalLikes)}
                    </span>
                  </td>

                  {/* Eng Rate - number on top, 5-segment bar below */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-mono font-semibold tabular-nums">
                        {engRate.toFixed(1)}%
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 w-3 rounded-full",
                              getBarColor(i, engBars),
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  field,
  currentField,
  onToggle,
  renderIcon,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  onToggle: (field: SortField) => void;
  renderIcon: (field: SortField) => React.ReactNode;
}) {
  return (
    <th
      className="px-3 py-2.5 text-center text-xs font-medium tracking-wider cursor-pointer hover:bg-muted/20 transition-colors"
      onClick={() => onToggle(field)}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-1",
          currentField === field
            ? "text-foreground"
            : "text-muted-foreground",
        )}
      >
        <span>{label}</span>
        {renderIcon(field)}
      </div>
    </th>
  );
}
