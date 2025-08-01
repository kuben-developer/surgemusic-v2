"use client"

import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateStepProps {
  startDate: Date;
  onStartDateChange: (date: Date | undefined) => void;
}

export function DateStep({ startDate, onStartDateChange }: DateStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-medium flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Select start date
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose when you want to start publishing your posts.
        </p>
        <div className="flex justify-center p-2">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </div>
        <div className="text-sm text-center text-muted-foreground pt-2">
          Your campaign will start on <span className="font-medium">{format(startDate, "MMMM d, yyyy")}</span>
        </div>
      </div>
    </div>
  );
}