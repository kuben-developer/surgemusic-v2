"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SortField, SortOrder } from "../../shared/types/common.types";

interface SortToggleButtonsProps {
  activeField: SortField | null;
  activeOrder: SortOrder;
  onSortChange: (field: SortField) => void;
}

export function SortToggleButtons({
  activeField,
  activeOrder,
  onSortChange,
}: SortToggleButtonsProps) {
  const isActive = (field: SortField) => activeField === field;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isActive("clarity") ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("clarity")}
        className="gap-1.5"
      >
        Clarity
        {isActive("clarity") &&
          (activeOrder === "desc" ? (
            <ArrowDown className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          ))}
      </Button>

      <Button
        variant={isActive("brightness") ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("brightness")}
        className="gap-1.5"
      >
        Brightness
        {isActive("brightness") &&
          (activeOrder === "desc" ? (
            <ArrowDown className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          ))}
      </Button>
    </div>
  );
}
