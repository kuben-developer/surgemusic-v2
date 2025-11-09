"use client"

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

interface Section {
  title: string;
  error: boolean;
}

interface NavigationControlsProps {
  sections: Section[];
  currentSection: number;
  isPending: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGenerate: () => void;
  disableNext?: boolean;
}

export function NavigationControls({
  sections,
  currentSection,
  isPending,
  onPrevious,
  onNext,
  onGenerate,
  disableNext = false,
}: NavigationControlsProps) {
  const isLastStep = currentSection === sections.length - 1;

  return (
    <div className="fixed bottom-0 left-0 md:left-[16rem] right-0 bg-background/80 backdrop-blur-sm border-t z-50">
      <div className="container max-w-5xl mx-auto py-4 px-4">
        <div className="flex justify-between items-center gap-4">
          <Button
            size="lg"
            variant="outline"
            className="min-w-[140px] gap-2 transition-all duration-200 hover:bg-muted cursor-pointer"
            onClick={onPrevious}
            disabled={currentSection === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Center section indicator */}
          <div className="hidden md:flex items-center gap-2">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`w-8 h-1 rounded-full transition-all duration-300
                  ${index === currentSection ? 'bg-primary w-12' :
                    index < currentSection ? 'bg-primary/50' : 'bg-muted'}`}
              />
            ))}
          </div>

          {isLastStep ? (
            <Button
              size="lg"
              className="min-w-[140px] cursor-pointer gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              onClick={onGenerate}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Videos
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              className="min-w-[140px] cursor-pointer gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              onClick={onNext}
              disabled={disableNext}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
