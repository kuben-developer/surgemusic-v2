"use client";

import { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClipsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
  className?: string;
}

export const ClipsPagination = memo(function ClipsPagination({
  currentPage,
  totalPages,
  onPageChange,
  isPending = false,
  className,
}: ClipsPaginationProps) {
  const handlePrevPage = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [onPageChange, currentPage]);

  const handleNextPage = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [onPageChange, currentPage]);

  const pageButtons = useMemo(() => {
    const buttons = [];
    const maxButtonsToShow = 10;

    const ellipsis = (key: string) => (
      <div key={key} className="px-2 text-muted-foreground">
        ...
      </div>
    );

    const createPageButton = (page: number) => {
      const isActive = currentPage === page;
      return (
        <Button
          key={page}
          variant={isActive ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(page)}
          className={cn(
            "h-9 w-9",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-background/50 border-primary/20 hover:border-primary/40"
          )}
        >
          {page}
        </Button>
      );
    };

    // Always show first page
    buttons.push(createPageButton(1));

    // Calculate the range of pages to show around current page
    let startPage = Math.max(2, currentPage - Math.floor(maxButtonsToShow / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxButtonsToShow - 3);

    if (endPage - startPage < maxButtonsToShow - 3) {
      startPage = Math.max(2, endPage - (maxButtonsToShow - 3) + 1);
    }

    // Add ellipsis if there's a gap after first page
    if (startPage > 2) {
      buttons.push(ellipsis("start-ellipsis"));
    }

    // Add the middle pages
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(createPageButton(i));
    }

    // Add ellipsis if there's a gap before last page
    if (endPage < totalPages - 1) {
      buttons.push(ellipsis("end-ellipsis"));
    }

    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      buttons.push(createPageButton(totalPages));
    }

    return buttons;
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", isPending && "opacity-70", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">{pageButtons}</div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});
