"use client";

import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface ScheduledDateProps {
  scheduledDate: Date | null;
}

export function ScheduledDate({ scheduledDate }: ScheduledDateProps) {
  if (!scheduledDate) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="font-medium">
          {format(scheduledDate, "MMM d, yyyy")}
        </span>
        <span className="text-xs text-muted-foreground">
          {format(scheduledDate, "h:mm a")}
        </span>
      </div>
    </div>
  );
}