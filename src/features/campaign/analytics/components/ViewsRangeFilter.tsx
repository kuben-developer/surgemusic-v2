"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import type { ViewsFilter } from "../types/analytics.types";

interface ViewsRangeFilterProps {
  minViews?: number;
  maxViews?: number;
  onFilterChange: (filter: ViewsFilter) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function formatViewCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export function ViewsRangeFilter({
  minViews,
  maxViews,
  onFilterChange,
  onClear,
  hasActiveFilters,
}: ViewsRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(minViews?.toString() ?? "");
  const [localMax, setLocalMax] = useState(maxViews?.toString() ?? "");

  const handleApply = useCallback(() => {
    onFilterChange({
      minViews: localMin ? parseInt(localMin, 10) : undefined,
      maxViews: localMax ? parseInt(localMax, 10) : undefined,
    });
    setOpen(false);
  }, [localMin, localMax, onFilterChange]);

  const handleClear = useCallback(() => {
    setLocalMin("");
    setLocalMax("");
    onClear();
    setOpen(false);
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleApply();
      }
    },
    [handleApply]
  );

  // Generate display label for the button
  const getFilterLabel = () => {
    if (!hasActiveFilters) return "Filter";
    if (minViews !== undefined && maxViews !== undefined) {
      return `${formatViewCount(minViews)} - ${formatViewCount(maxViews)}`;
    }
    if (minViews !== undefined) return `${formatViewCount(minViews)}+`;
    if (maxViews !== undefined) return `≤${formatViewCount(maxViews)}`;
    return "Filter";
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? "secondary" : "outline"}
            size="sm"
            className="h-8 gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="text-xs">{getFilterLabel()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <p className="text-sm font-medium">Filter by views</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                min={0}
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
                min={0}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleApply} className="flex-1 h-8">
                Apply
              </Button>
              {hasActiveFilters && (
                <Button size="sm" variant="outline" onClick={handleClear} className="h-8">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-8 w-8 p-0"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
