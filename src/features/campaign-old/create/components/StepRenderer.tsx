"use client";

import { useStepNavigation } from "../hooks/useStepNavigation";
import type { StepProps } from "./step-config";

interface StepRendererProps extends StepProps {
  currentSection: number;
  totalCredits: number;
  isSubscribed: boolean;
  isTrial: boolean;
  qualifiesForFreeVideos?: boolean;
}

export function StepRenderer({
  currentSection,
  campaignType,
  totalCredits,
  isSubscribed,
  isTrial,
  qualifiesForFreeVideos,
  ...stepProps
}: StepRendererProps) {
  const { getStepByIndex } = useStepNavigation({ campaignType, selectedThemes: stepProps.selectedThemes });

  // Get the current step configuration
  const currentStep = getStepByIndex(currentSection);

  if (!currentStep) {
    return null;
  }

  const Component = currentStep.component;
  const componentProps = currentStep.propsSelector({
    ...stepProps,
    campaignType,
    totalCredits,
    isSubscribed,
    isTrial,
    qualifiesForFreeVideos,
  });

  return (
    <div className="space-y-16 mb-10">
      <Component {...componentProps} />
    </div>
  );
}
