"use client";

import { Layers } from "lucide-react";
import type { VideoCategoryStats } from "../../shared/types/campaign.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VideoCategoryTableProps {
  categories: VideoCategoryStats[];
  onSelectCategory: (category: string) => void;
}

function getProgressColor(withUrl: number, total: number): string {
  if (total === 0) return "text-muted-foreground";
  const percentage = (withUrl / total) * 100;

  if (percentage >= 100) return "text-green-600 dark:text-green-500";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-500";
  return "text-red-600 dark:text-red-500";
}

export function VideoCategoryTable({
  categories,
  onSelectCategory,
}: VideoCategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Layers className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Categories Found</h3>
        <p className="text-sm">No video categories available for this campaign.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70%]">Video Category</TableHead>
            <TableHead className="text-center w-[30%]">Videos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.category}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectCategory(category.category)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <span>{category.category}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    "font-mono text-md font-semibold",
                    getProgressColor(category.withUrlCount, category.totalCount)
                  )}
                >
                  {category.withUrlCount}/{category.totalCount}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
