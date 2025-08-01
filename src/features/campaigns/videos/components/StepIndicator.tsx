"use client"

import { cn } from "@/lib/utils";
import { Users, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import type { Step, StepConfig } from "../types/schedule.types";

interface StepIndicatorProps {
  currentStep: Step;
}

const STEPS: StepConfig[] = [
  { key: "profiles", label: "Profiles", icon: Users },
  { key: "date", label: "Date", icon: CalendarIcon },
  { key: "time", label: "Times", icon: Clock },
  { key: "review", label: "Review", icon: CheckCircle2 },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      {STEPS.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
              currentStep === step.key
                ? "bg-primary text-primary-foreground"
                : STEPS.findIndex(s => s.key === currentStep) > index
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            <step.icon className="h-4 w-4" />
          </div>
          <div
            className={cn(
              "text-xs mx-2",
              currentStep === step.key
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            {step.label}
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px w-4 sm:w-8 bg-muted transition-colors",
                STEPS.findIndex(s => s.key === currentStep) > index && "bg-primary/50"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}