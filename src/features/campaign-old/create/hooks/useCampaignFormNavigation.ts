interface FormSection {
  title: string;
  error: boolean;
}

interface NavigationProps {
  currentSection: number;
  setCurrentSection: (section: number) => void;
  sections: FormSection[];
}

export function useCampaignFormNavigation({
  currentSection,
  setCurrentSection,
  sections,
}: NavigationProps) {
  
  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canGoNext = currentSection < sections.length - 1;
  const canGoPrevious = currentSection > 0;
  const isLastStep = currentSection === sections.length - 1;

  return {
    handleNext,
    handlePrevious,
    canGoNext,
    canGoPrevious,
    isLastStep,
  };
}