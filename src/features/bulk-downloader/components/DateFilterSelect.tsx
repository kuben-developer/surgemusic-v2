"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateFilterOption } from "../types/bulk-downloader.types";

interface DateFilterSelectProps {
  value: DateFilterOption;
  onChange: (value: DateFilterOption) => void;
  customDate?: Date;
  onCustomDateChange: (date: Date | undefined) => void;
}

const DATE_FILTER_OPTIONS: Array<{ value: DateFilterOption; label: string }> = [
  { value: "all", label: "All time" },
  { value: "last_week", label: "Last week" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "last_6_months", label: "Last 6 months" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Select date..." },
];

export function DateFilterSelect({
  value,
  onChange,
  customDate,
  onCustomDateChange,
}: DateFilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Download videos uploaded after</Label>
      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={(v) => onChange(v as DateFilterOption)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {value === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !customDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDate ? format(customDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={onCustomDateChange}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Only videos uploaded after the selected date will be downloaded
      </p>
    </div>
  );
}
