"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { TIME_SLOTS } from "../constants/platforms";

interface TimeStepProps {
  selectedTimeSlots: string[];
  onToggleTimeSlot: (slotId: string) => void;
}

export function TimeStep({ selectedTimeSlots, onToggleTimeSlot }: TimeStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-medium flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Select posting times
          <Badge variant="secondary" className="ml-auto">
            {selectedTimeSlots.length}/3 selected
          </Badge>
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose up to 3 times when your posts will be published each day.
        </p>
        <div className="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto p-1">
          {TIME_SLOTS.map((slot) => (
            <Button
              key={slot.id}
              variant={selectedTimeSlots.includes(slot.id) ? "default" : "outline"}
              className={cn(
                "w-full justify-center",
                selectedTimeSlots.includes(slot.id) ? "bg-primary" : "hover:bg-muted",
                selectedTimeSlots.length >= 3 && !selectedTimeSlots.includes(slot.id) && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => onToggleTimeSlot(slot.id)}
              disabled={selectedTimeSlots.length >= 3 && !selectedTimeSlots.includes(slot.id)}
            >
              {slot.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}