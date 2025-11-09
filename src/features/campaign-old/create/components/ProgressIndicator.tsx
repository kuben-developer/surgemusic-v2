"use client"

interface Section {
  title: string;
  error: boolean;
}

interface ProgressIndicatorProps {
  sections: Section[];
  currentSection: number;
}

export function ProgressIndicator({ sections, currentSection }: ProgressIndicatorProps) {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          {sections[currentSection]?.title || 'Create Campaign'}
        </h2>
        <p className="text-muted-foreground">
          Step {currentSection + 1} of {sections.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto">
        <div className="flex mt-2">
          {sections.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 flex-1
                ${index <= currentSection ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              style={{
                marginLeft: index === 0 ? '0' : '4px',
                marginRight: index === sections.length - 1 ? '0' : '4px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}