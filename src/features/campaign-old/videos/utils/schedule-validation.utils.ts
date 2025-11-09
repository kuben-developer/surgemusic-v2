import type { Step } from "../types/schedule.types";

interface ValidationContext {
  currentStep: Step;
  selectedProfilesCount: number;
  selectedTimeSlotsCount: number;
}

/**
 * Validates if the current step has valid data to proceed to the next step
 */
export function validateStep({ 
  currentStep, 
  selectedProfilesCount, 
  selectedTimeSlotsCount 
}: ValidationContext): boolean {
  switch (currentStep) {
    case "profiles":
      return selectedProfilesCount > 0;
    case "date":
      return true; // Date is always valid as we have a default
    case "time":
      return selectedTimeSlotsCount > 0;
    case "review":
      return true; // Review step doesn't need validation to proceed
    default:
      return false;
  }
}

/**
 * Gets validation error message for the current step
 */
export function getStepValidationMessage(currentStep: Step): string | null {
  switch (currentStep) {
    case "profiles":
      return "Please select at least one profile to continue";
    case "time":
      return "Please select at least one time slot to continue";
    default:
      return null;
  }
}

/**
 * Validates if we can schedule posts with the current selections
 */
export function validateScheduleReadiness({
  selectedProfilesCount,
  selectedTimeSlotsCount,
  selectedVideosCount
}: {
  selectedProfilesCount: number;
  selectedTimeSlotsCount: number;
  selectedVideosCount: number;
}): { isValid: boolean; message?: string } {
  if (selectedProfilesCount === 0) {
    return { isValid: false, message: "No profiles selected" };
  }
  
  if (selectedTimeSlotsCount === 0) {
    return { isValid: false, message: "No time slots selected" };
  }
  
  if (selectedVideosCount === 0) {
    return { isValid: false, message: "No videos selected" };
  }
  
  return { isValid: true };
}