"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw, Download, Calendar } from "lucide-react";

interface AnalyticsHeaderProps {
  title: string;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  showExport?: boolean;
  dateRange: number;
  onDateRangeChange: (days: number) => void;
}

export function AnalyticsHeader({
  title,
  onRefresh,
  isRefreshing,
  showExport = false,
  dateRange,
  onDateRangeChange,
}: AnalyticsHeaderProps) {
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export analytics data");
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Track performance metrics and engagement across your content
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Range Selector */}
        <Select
          value={dateRange.toString()}
          onValueChange={(value) => onDateRangeChange(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        {/* Export Button */}
        {showExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="ml-2 hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  );
}