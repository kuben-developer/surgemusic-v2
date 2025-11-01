"use client";

import { ArrowLeft, ArrowUpDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOptions } from "../../shared/types/common.types";

interface ClipsToolbarProps {
  onBack: () => void;
  selectedCount: number;
  onDelete: () => void;
  sortOptions: SortOptions;
  onSortChange: (field: string) => void;
  folderName: string;
}

export function ClipsToolbar({
  onBack,
  selectedCount,
  onDelete,
  sortOptions,
  onSortChange,
  folderName,
}: ClipsToolbarProps) {
  const getSortValue = () => {
    return `${sortOptions.field}-${sortOptions.order}`;
  };

  const handleSortChange = (value: string) => {
    onSortChange(value);
  };

  return (
    <div className="space-y-4 pb-6 border-b">
      {/* Header section */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{folderName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedCount > 0 ? `${selectedCount} selected` : "Manage your clips"}
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
        <Select value={getSortValue()} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <ArrowUpDown className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="clarity-desc">Clarity: High to Low</SelectItem>
            <SelectItem value="clarity-asc">Clarity: Low to High</SelectItem>
            <SelectItem value="brightness-desc">
              Brightness: High to Low
            </SelectItem>
            <SelectItem value="brightness-asc">
              Brightness: Low to High
            </SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>

        {selectedCount > 0 && (
          <Button variant="destructive" onClick={onDelete} className="w-full sm:w-auto">
            <Trash2 className="size-4 sm:mr-2" />
            <span className="sm:inline">Delete ({selectedCount})</span>
          </Button>
        )}
      </div>
    </div>
  );
}
