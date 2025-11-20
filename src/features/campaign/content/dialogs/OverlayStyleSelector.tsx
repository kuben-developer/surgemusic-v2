"use client";

import { cn } from "@/lib/utils";
import { OVERLAY_STYLE_OPTIONS } from "../constants/overlay-styles.constants";
import type { OverlayStyle } from "../constants/overlay-styles.constants";

interface OverlayStyleSelectorProps {
  selectedStyle: OverlayStyle | null;
  onSelectStyle: (style: OverlayStyle) => void;
}

export function OverlayStyleSelector({
  selectedStyle,
  onSelectStyle,
}: OverlayStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OVERLAY_STYLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedStyle === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectStyle(option.value)}
              className={cn(
                "relative rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
                isSelected
                  ? "border-primary bg-accent"
                  : "border-border bg-background"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "rounded-md p-2 bg-accent",
                    isSelected && "bg-primary/10"
                  )}
                >
                  <Icon
                    className={cn("size-5", isSelected ? "text-primary" : option.color)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {option.description}
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3 text-primary-foreground"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedStyle && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <span className="font-medium">{selectedStyle}</span> overlay style
          selected
        </div>
      )}
    </div>
  );
}
