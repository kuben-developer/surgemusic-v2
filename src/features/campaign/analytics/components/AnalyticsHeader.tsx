"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar as CalendarIcon, X } from "lucide-react";
import Link from "next/link";
import { fadeInUp } from "../constants/metrics";
import type { DateFilter } from "../types/analytics.types";
import { format } from "date-fns";
import type { DateRange, DayButtonProps } from "react-day-picker";
import { AnalyticsSettings, type CurrencySymbol, type AnalyticsSettingsValues } from "./AnalyticsSettings";

interface AnalyticsHeaderProps {
  campaignId: string;
  dateFilter: DateFilter | null;
  postCountsByDate: Record<string, number>;
  lastUpdatedAt?: number;
  onDateFilterChange: (value: DateFilter | null) => void;
  isPublic?: boolean;
  hideBackButton?: boolean;
  minViewsFilter?: number;
  currencySymbol?: CurrencySymbol;
  manualCpmMultiplier?: number;
  apiCpmMultiplier?: number;
  onSettingsChange?: (settings: AnalyticsSettingsValues) => void;
}

export function AnalyticsHeader({
  campaignId,
  dateFilter,
  postCountsByDate,
  lastUpdatedAt,
  onDateFilterChange,
  isPublic = false,
  hideBackButton = false,
  minViewsFilter = 0,
  currencySymbol = "USD",
  manualCpmMultiplier = 0.5,
  apiCpmMultiplier = 0.5,
  onSettingsChange,
}: AnalyticsHeaderProps) {
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    dateFilter ? { from: dateFilter.startDate, to: dateFilter.endDate } : undefined
  );

  // Helper function to format date as YYYY-MM-DD treating calendar date as UTC
  // Calendar gives us dates at local midnight, but we treat them as UTC dates
  const formatDateUTC = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to check if a date has posts
  const hasPostsOnDate = (date: Date): boolean => {
    const dateKey = formatDateUTC(date);
    return (postCountsByDate[dateKey] ?? 0) > 0;
  };

  // Helper function to get post count for a date
  const getPostCount = (date: Date): number => {
    const dateKey = formatDateUTC(date);
    return postCountsByDate[dateKey] ?? 0;
  };

  // Custom day button to show post count
  const CustomDayButton = (props: DayButtonProps) => {
    const count = getPostCount(props.day.date);
    const isSelected = props.modifiers?.selected ?? props.modifiers?.range_start ?? props.modifiers?.range_end ?? props.modifiers?.range_middle;

    return (
      <CalendarDayButton {...props}>
        <div className="flex flex-col items-center justify-center">
          <span>{props.day.date.getDate()}</span>
          {count > 0 && (
            <span className={`text-[9px] font-medium ${isSelected ? 'text-primary-foreground' : 'text-primary/80'}`}>
              {count}
            </span>
          )}
        </div>
      </CalendarDayButton>
    );
  };

  const handleApply = () => {
    if (tempDateRange?.from) {
      onDateFilterChange({
        startDate: tempDateRange.from,
        endDate: tempDateRange.to ?? tempDateRange.from,
      });
    }
  };

  const handleClear = () => {
    setTempDateRange(undefined);
    onDateFilterChange(null);
  };

  const getDisplayText = () => {
    if (!dateFilter) return "Filter by post date";

    const startFormatted = format(dateFilter.startDate, "MMM d, yyyy");
    const endFormatted = format(dateFilter.endDate, "MMM d, yyyy");

    if (startFormatted === endFormatted) {
      return startFormatted;
    }

    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <>
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {!isPublic && !hideBackButton && (
          <div className="flex items-center gap-2">
            <Link href={`/campaign/${campaignId}`}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              Analytics Dashboard
            </h1>
          </div>
        )}

        {!isPublic && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{getDisplayText()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  disabled={(date) => !hasPostsOnDate(date)}
                  numberOfMonths={1}
                  className="p-3 sm:hidden"
                  components={{
                    DayButton: CustomDayButton,
                  }}
                />
                <Calendar
                  mode="range"
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  disabled={(date) => !hasPostsOnDate(date)}
                  numberOfMonths={2}
                  className="p-3 hidden sm:block"
                  components={{
                    DayButton: CustomDayButton,
                  }}
                />
                <div className="p-3 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!tempDateRange?.from}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {dateFilter && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Settings button - only visible for logged-in users */}
            {onSettingsChange && (
              <AnalyticsSettings
                campaignId={campaignId}
                minViewsFilter={minViewsFilter}
                currencySymbol={currencySymbol}
                manualCpmMultiplier={manualCpmMultiplier}
                apiCpmMultiplier={apiCpmMultiplier}
                onSettingsChange={onSettingsChange}
              />
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
