"use client";

import { useMemo } from "react";
import { STEP_CONFIGS, type StepConfig } from "../components/step-config";

interface UseStepNavigationProps {
  campaignType: "custom" | "express";
  selectedThemes?: string[];
}

export function useStepNavigation({ campaignType, selectedThemes = [] }: UseStepNavigationProps) {
  const includeVideoAssets = selectedThemes.includes("reactions");
  const availableSteps = useMemo(() => {
    let steps = STEP_CONFIGS.filter(step => step.availableFor.includes(campaignType));
    if (!includeVideoAssets) {
      steps = steps.filter(step => step.id !== "video-assets");
    }
    return steps;
  }, [campaignType, includeVideoAssets]);

  const getStepByIndex = (index: number): StepConfig | null => {
    return availableSteps[index] || null;
  };

  const getTotalSteps = (): number => {
    return availableSteps.length;
  };

  const getStepIndex = (stepId: string): number => {
    return availableSteps.findIndex(step => step.id === stepId);
  };

  return {
    availableSteps,
    getStepByIndex,
    getTotalSteps,
    getStepIndex,
  };
}
