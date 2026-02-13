"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar as CalendarIcon, Settings, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import type { DateRange, DayButtonProps } from "react-day-picker";
import { fadeInUp } from "../constants/metrics-v2";
import type { CampaignSettings } from "../types/analytics-v2.types";

export interface DateRangeFilter {
  from: number; // unix seconds
  to: number;   // unix seconds
}

interface AnalyticsV2HeaderProps {
  campaignId: string;
  postCountsByDate: Record<string, number>;
  settings: CampaignSettings;
  isPublic?: boolean;
  hideBackButton?: boolean;
  onDateRangeChange: (range: DateRangeFilter | undefined) => void;
}

const QUICK_MIN_VIEWS_OPTIONS = [
  { label: "Show all", value: 0 },
  { label: "1+", value: 1 },
  { label: "100+", value: 100 },
  { label: "1K+", value: 1000 },
  { label: "10K+", value: 10000 },
];

export function AnalyticsV2Header({
  campaignId,
  postCountsByDate,
  settings,
  isPublic = false,
  hideBackButton = false,
  onDateRangeChange,
}: AnalyticsV2HeaderProps) {
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const hasAppliedFilter = !!appliedDateRange?.from;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localMinViews, setLocalMinViews] = useState(settings.minViewsFilter.toString());
  const [localCurrency, setLocalCurrency] = useState(settings.currencySymbol);
  const [localManualCpm, setLocalManualCpm] = useState(settings.manualCpmMultiplier.toString());
  const [localApiCpm, setLocalApiCpm] = useState(settings.apiCpmMultiplier.toString());
  const [isSaving, setIsSaving] = useState(false);

  const updateMinViewsFilter = useMutation(api.app.analyticsV2.updateMinViewsFilter);
  const updateCampaignSettings = useMutation(api.app.analyticsV2.updateCampaignSettings);

  const formatDateUTC = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const hasPostsOnDate = (date: Date): boolean => {
    return (postCountsByDate[formatDateUTC(date)] ?? 0) > 0;
  };

  const getPostCount = (date: Date): number => {
    return postCountsByDate[formatDateUTC(date)] ?? 0;
  };

  const CustomDayButton = (props: DayButtonProps) => {
    const count = getPostCount(props.day.date);
    const isSelected =
      props.modifiers?.selected ??
      props.modifiers?.range_start ??
      props.modifiers?.range_end ??
      props.modifiers?.range_middle;

    return (
      <CalendarDayButton {...props}>
        <div className="flex flex-col items-center justify-center">
          <span>{props.day.date.getDate()}</span>
          {count > 0 && (
            <span
              className={`text-[9px] font-medium ${isSelected ? "text-primary-foreground" : "text-primary/80"}`}
            >
              {count}
            </span>
          )}
        </div>
      </CalendarDayButton>
    );
  };

  const clearDateFilter = useCallback(() => {
    setTempDateRange(undefined);
    setAppliedDateRange(undefined);
    onDateRangeChange(undefined);
  }, [onDateRangeChange]);

  const applyDateFilter = useCallback(() => {
    if (tempDateRange?.from) {
      const fromDate = tempDateRange.from;
      const toDate = tempDateRange.to ?? tempDateRange.from;
      const fromTimestamp = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0) / 1000;
      const toTimestamp = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59) / 1000;
      setAppliedDateRange(tempDateRange);
      onDateRangeChange({ from: fromTimestamp, to: toTimestamp });
      setCalendarOpen(false);
    }
  }, [tempDateRange, onDateRangeChange]);

  const getDateDisplayText = () => {
    if (!appliedDateRange?.from) return "Filter by post date";
    if (appliedDateRange.to && appliedDateRange.from.getTime() !== appliedDateRange.to.getTime()) {
      return `${format(appliedDateRange.from, "MMM d")} - ${format(appliedDateRange.to, "MMM d, yyyy")}`;
    }
    return format(appliedDateRange.from, "MMM d, yyyy");
  };

  const handleSaveSettings = useCallback(async () => {
    const minViews = parseInt(localMinViews, 10) || 0;
    const manualCpm = parseFloat(localManualCpm) || 1;
    const apiCpm = parseFloat(localApiCpm) || 0.5;

    setIsSaving(true);
    try {
      if (minViews !== settings.minViewsFilter) {
        await updateMinViewsFilter({ campaignId, minViewsFilter: minViews });
      }
      await updateCampaignSettings({
        campaignId,
        currencySymbol: localCurrency,
        manualCpmMultiplier: manualCpm,
        apiCpmMultiplier: apiCpm,
      });
      toast.success("Settings saved");
      setSettingsOpen(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [
    campaignId,
    localMinViews,
    localCurrency,
    localManualCpm,
    localApiCpm,
    settings.minViewsFilter,
    updateMinViewsFilter,
    updateCampaignSettings,
  ]);

  const hasChanges =
    parseInt(localMinViews, 10) !== settings.minViewsFilter ||
    localCurrency !== settings.currencySymbol ||
    parseFloat(localManualCpm) !== settings.manualCpmMultiplier ||
    parseFloat(localApiCpm) !== settings.apiCpmMultiplier;

  return (
    <motion.div
      variants={fadeInUp}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      {!isPublic && !hideBackButton && (
        <div className="flex items-center gap-2">
          <Link href={`/campaign/${campaignId}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Analytics V2
          </h1>
        </div>
      )}

      {!isPublic && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Date filter */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full sm:w-[280px] justify-start text-left font-normal ${
                  hasAppliedFilter
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <CalendarIcon className={`mr-2 h-4 w-4 flex-shrink-0 ${hasAppliedFilter ? "text-primary" : ""}`} />
                <span className="truncate flex-1">{getDateDisplayText()}</span>
                {hasAppliedFilter && (
                  <span
                    role="button"
                    className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDateFilter();
                    }}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                )}
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
                components={{ DayButton: CustomDayButton }}
              />
              <Calendar
                mode="range"
                selected={tempDateRange}
                onSelect={setTempDateRange}
                disabled={(date) => !hasPostsOnDate(date)}
                numberOfMonths={2}
                className="p-3 hidden sm:block"
                components={{ DayButton: CustomDayButton }}
              />
              <div className="p-3 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearDateFilter();
                    setCalendarOpen(false);
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  disabled={!tempDateRange?.from}
                  onClick={applyDateFilter}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Min views badge */}
          {settings.minViewsFilter > 0 && (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {settings.minViewsFilter.toLocaleString()}+ views
            </Badge>
          )}

          {/* Settings */}
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Analytics Settings</h4>
                  <p className="text-xs text-muted-foreground">
                    Configure display settings for this campaign.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Minimum Views Filter</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Hide posts with fewer views
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUICK_MIN_VIEWS_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          variant={
                            parseInt(localMinViews, 10) === opt.value
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setLocalMinViews(opt.value.toString())}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Custom minimum"
                      value={localMinViews}
                      onChange={(e) => setLocalMinViews(e.target.value)}
                      className="h-8 text-sm"
                      min={0}
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Currency</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant={localCurrency === "USD" ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => setLocalCurrency("USD")}
                      >
                        $ USD
                      </Button>
                      <Button
                        variant={localCurrency === "GBP" ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => setLocalCurrency("GBP")}
                      >
                        £ GBP
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">CPM Rates</Label>
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs w-16 flex-shrink-0">Manual</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={localManualCpm}
                          onChange={(e) => setLocalManualCpm(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs w-16 flex-shrink-0">API</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={localApiCpm}
                          onChange={(e) => setLocalApiCpm(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !hasChanges}
                  className="w-full h-8"
                  size="sm"
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </motion.div>
  );
}
