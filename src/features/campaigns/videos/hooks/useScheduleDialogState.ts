"use client";

import { useState } from "react";
import type { Step } from "../types/schedule.types";

interface UseScheduleDialogStateProps {
  onOpenChange: (open: boolean) => void;
}

export function useScheduleDialogState({ onOpenChange }: UseScheduleDialogStateProps) {
  const [currentStep, setCurrentStep] = useState<Step>("profiles");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());

  // Time slot management with max 3 posts per day
  const toggleTimeSlot = (slotId: string) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      } else {
        // Enforce max 3 posts per day
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, slotId];
      }
    });
  };

  // Step navigation
  const goToNextStep = () => {
    if (currentStep === "profiles") setCurrentStep("date");
    else if (currentStep === "date") setCurrentStep("time");
    else if (currentStep === "time") setCurrentStep("review");
  };

  const goToPrevStep = () => {
    if (currentStep === "date") setCurrentStep("profiles");
    else if (currentStep === "time") setCurrentStep("date");
    else if (currentStep === "review") setCurrentStep("time");
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const resetState = () => {
    setCurrentStep("profiles");
    setSelectedTimeSlots([]);
    setStartDate(new Date());
  };

  return {
    // State
    currentStep,
    selectedTimeSlots,
    startDate,
    
    // Actions
    setCurrentStep,
    setSelectedTimeSlots,
    setStartDate,
    toggleTimeSlot,
    goToNextStep,
    goToPrevStep,
    handleCancel,
    resetState,
  };
}