"use client";

import { useMemo } from "react";
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek, isThisMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AlertCircle, Calendar, CheckCircle, Clock, FileVideo } from "lucide-react";

interface DateStat {
  date: string | null; // null for unscheduled/legacy
  total: number;
  needed?: number;      // Red - no video assigned
  processing?: number;  // Amber - ready_for_processing
  ready?: number;       // Green - processed
  scheduled?: number;   // Blue - has video_url, no api_post_id
  published?: number;   // Purple - has api_post_id
}

interface DateFilterTabsProps {
  dateStats: DateStat[];
  selectedDate: string | null; // null means "All", "unscheduled" for unscheduled items
  onSelectDate: (date: string | null) => void;
  className?: string;
}

export function DateFilterTabs({
  dateStats,
  selectedDate,
  onSelectDate,
  className,
}: DateFilterTabsProps) {
  // Sort dates chronologically, with null (unscheduled) at the end
  const sortedStats = useMemo(() => {
    return [...dateStats].sort((a, b) => {
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      return a.date.localeCompare(b.date);
    });
  }, [dateStats]);

  // Calculate totals
  const totals = useMemo(() => {
    return dateStats.reduce(
      (acc, stat) => ({
        total: acc.total + stat.total,
        needed: acc.needed + (stat.needed ?? 0),
        processing: acc.processing + (stat.processing ?? 0),
        ready: acc.ready + (stat.ready ?? 0),
        scheduled: acc.scheduled + (stat.scheduled ?? 0),
        published: acc.published + (stat.published ?? 0),
      }),
      { total: 0, needed: 0, processing: 0, ready: 0, scheduled: 0, published: 0 }
    );
  }, [dateStats]);

  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-3">
          {/* All Card */}
          <DateCard
            label="All Dates"
            isSelected={selectedDate === null}
            onClick={() => onSelectDate(null)}
            stats={totals}
          />

          {/* Date Cards */}
          {sortedStats.map((stat) => (
            <DateCard
              key={stat.date ?? "unscheduled"}
              date={stat.date}
              isSelected={selectedDate === (stat.date ?? "unscheduled")}
              onClick={() => onSelectDate(stat.date ?? "unscheduled")}
              stats={stat}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

interface DateCardProps {
  date?: string | null;
  label?: string;
  isSelected: boolean;
  onClick: () => void;
  stats: {
    total: number;
    needed?: number;
    processing?: number;
    ready?: number;
    scheduled?: number;
    published?: number;
  };
}

function DateCard({ date, label, isSelected, onClick, stats }: DateCardProps) {
  const isUnscheduled = date === null;
  const dateObj = date ? parseISO(date) : null;
  const isOverdue = dateObj && isPast(dateObj) && !isToday(dateObj);

  // Get display label
  const getLabel = (): string => {
    if (label) return label;
    if (isUnscheduled) return "No Date";
    if (!dateObj) return "Invalid";
    if (isToday(dateObj)) return "Today";
    if (isTomorrow(dateObj)) return "Tomorrow";
    return format(dateObj, "EEE");
  };

  // Get date display
  const getDateDisplay = (): string | null => {
    if (label || isUnscheduled || !dateObj) return null;
    if (isToday(dateObj) || isTomorrow(dateObj)) {
      return format(dateObj, "MMM d");
    }
    return format(dateObj, "MMM d");
  };

  const dateDisplay = getDateDisplay();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center min-w-[5.5rem] px-3 py-2 rounded-lg border-2 transition-all",
        "hover:border-primary/50 hover:bg-accent/50",
        isSelected
          ? "border-primary bg-primary/5"
          : isOverdue
            ? "border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20"
            : isUnscheduled
              ? "border-dashed border-muted-foreground/30 bg-muted/30"
              : "border-border bg-card"
      )}
    >
      {/* Day Label */}
      <span
        className={cn(
          "text-xs font-medium",
          isSelected
            ? "text-primary"
            : isOverdue
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground"
        )}
      >
        {getLabel()}
      </span>

      {/* Date */}
      {dateDisplay ? (
        <span
          className={cn(
            "text-sm font-semibold",
            isSelected ? "text-primary" : isOverdue ? "text-red-700 dark:text-red-300" : "text-foreground"
          )}
        >
          {dateDisplay}
        </span>
      ) : (
        <span className="h-5 font-semibold text-muted-foreground">
          &#8734;
        </span>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-1.5 mt-1.5">
        {(stats.needed ?? 0) > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-red-600 dark:text-red-400">
            <AlertCircle className="size-2.5" />
            {stats.needed}
          </span>
        )}
        {(stats.processing ?? 0) > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
            <Clock className="size-2.5" />
            {stats.processing}
          </span>
        )}
        {(stats.ready ?? 0) > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400">
            <CheckCircle className="size-2.5" />
            {stats.ready}
          </span>
        )}
        {(stats.scheduled ?? 0) > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400">
            <Calendar className="size-2.5" />
            {stats.scheduled}
          </span>
        )}
        {(stats.published ?? 0) > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 dark:text-purple-400">
            <FileVideo className="size-2.5" />
            {stats.published}
          </span>
        )}
      </div>

      {/* Total */}
      <span className={cn(
        "text-lg font-bold mt-0.5",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {stats.total}
      </span>
    </button>
  );
}
