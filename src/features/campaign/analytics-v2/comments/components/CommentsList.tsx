"use client";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentItem } from "./CommentItem";
import { CommentsSortControls } from "./CommentsSortControls";
import type { TikTokComment, CommentSortBy, CommentSortOrder } from "../types/comment.types";
import type { Id } from "../../../../../../convex/_generated/dataModel";

interface CommentsListProps {
  comments: TikTokComment[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  sortBy: CommentSortBy;
  sortOrder: CommentSortOrder;
  selectedIds: Set<Id<"tiktokComments">>;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: CommentSortBy) => void;
  onToggleSelection: (id: Id<"tiktokComments">) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function CommentsList({
  comments,
  isLoading,
  totalCount,
  currentPage,
  totalPages,
  sortBy,
  sortOrder,
  selectedIds,
  onPageChange,
  onSortChange,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
}: CommentsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No comments found</p>
        <p className="text-sm mt-1">Use the scrape button to fetch comments from videos</p>
      </div>
    );
  }

  const allSelected = comments.every(c => selectedIds.has(c._id));
  const someSelected = selectedIds.size > 0;

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Selection controls */}
        <div className="flex items-center gap-2">
          {someSelected ? (
            <Button variant="ghost" size="sm" onClick={onDeselectAll}>
              Deselect ({selectedIds.size})
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
          )}
          {allSelected && comments.length > 0 && (
            <span className="text-xs text-muted-foreground">All selected</span>
          )}
        </div>

        {/* Sort controls */}
        <CommentsSortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </div>

      {/* Comments list */}
      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            isSelectable
            isChecked={selectedIds.has(comment._id)}
            onToggle={onToggleSelection}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount.toLocaleString()} comments)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
