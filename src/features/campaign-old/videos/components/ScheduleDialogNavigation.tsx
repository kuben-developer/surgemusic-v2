"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Step } from "../types/schedule.types";

interface ScheduleDialogNavigationProps {
  currentStep: Step;
  isStepValid: boolean;
  isScheduling: boolean;
  selectedVideosCount: number;
  onCancel: () => void;
  onGoToPrevStep: () => void;
  onGoToNextStep: () => void;
  onSchedule: () => void;
}

export function ScheduleDialogNavigation({
  currentStep,
  isStepValid,
  isScheduling,
  selectedVideosCount,
  onCancel,
  onGoToPrevStep,
  onGoToNextStep,
  onSchedule,
}: ScheduleDialogNavigationProps) {
  const isFirstStep = currentStep === "profiles";
  const isLastStep = currentStep === "review";

  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={isFirstStep ? onCancel : onGoToPrevStep}
        className="gap-2"
        disabled={isScheduling}
      >
        <ArrowLeft className="h-4 w-4" />
        {isFirstStep ? "Cancel" : "Back"}
      </Button>

      {isLastStep ? (
        <Button
          onClick={onSchedule}
          disabled={!isStepValid || isScheduling}
          className="gap-2"
        >
          {isScheduling ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Scheduling...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Schedule {selectedVideosCount} posts
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={onGoToNextStep}
          disabled={!isStepValid || isScheduling}
          className="gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}