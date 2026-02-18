"use client";

import { ArrowDownUp, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CommentSortBy, CommentSortOrder } from "../types/comment.types";

interface CommentsSortControlsProps {
  sortBy: CommentSortBy;
  sortOrder: CommentSortOrder;
  onSortChange: (sortBy: CommentSortBy) => void;
}

export function CommentsSortControls({ sortBy, sortOrder, onSortChange }: CommentsSortControlsProps) {
  const getSortLabel = () => {
    const field = sortBy === "likes" ? "Likes" : "Date";
    const direction = sortOrder === "desc" ? "High to Low" : "Low to High";
    return `${field}: ${direction}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowDownUp className="h-4 w-4" />
          <span className="hidden sm:inline">{getSortLabel()}</span>
          <span className="sm:hidden">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onSortChange("likes")}
          className={cn(sortBy === "likes" && "bg-accent")}
        >
          <Heart className="h-4 w-4 mr-2" />
          Sort by Likes {sortBy === "likes" && (sortOrder === "desc" ? "(High to Low)" : "(Low to High)")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange("createdAt")}
          className={cn(sortBy === "createdAt" && "bg-accent")}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Sort by Date {sortBy === "createdAt" && (sortOrder === "desc" ? "(Newest First)" : "(Oldest First)")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
