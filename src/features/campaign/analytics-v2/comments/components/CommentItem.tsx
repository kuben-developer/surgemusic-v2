"use client";

import { Heart, Calendar, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TikTokComment } from "../types/comment.types";
import type { Id } from "../../../../../../convex/_generated/dataModel";

interface CommentItemProps {
  comment: TikTokComment;
  isSelectable?: boolean;
  isChecked?: boolean;
  onToggle?: (id: Id<"tiktokComments">) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function CommentItem({ comment, isSelectable = false, isChecked = false, onToggle }: CommentItemProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg border bg-card transition-colors",
        isSelectable && comment.isSelected && "border-primary/30 bg-primary/5",
        isSelectable && "hover:bg-accent/50 cursor-pointer"
      )}
      onClick={() => isSelectable && onToggle?.(comment._id)}
    >
      {/* Checkbox for selection */}
      {isSelectable && (
        <div className="flex-shrink-0 pt-1">
          <Checkbox
            checked={isChecked}
            onCheckedChange={() => onToggle?.(comment._id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={comment.authorProfilePictureUrl ?? undefined} alt={comment.authorNickname} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{comment.authorNickname}</span>
          <span className="text-xs text-muted-foreground">@{comment.authorUsername}</span>
          {isSelectable && comment.isSelected && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              Selected
            </Badge>
          )}
        </div>

        {/* Comment text */}
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {comment.text}
        </p>

        {/* Footer with likes and date */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            <span>{comment.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1" title={formatDate(comment.createdAt)}>
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(comment.createdAt)}</span>
          </div>
          {comment.authorCountry && (
            <span className="text-xs">{comment.authorCountry}</span>
          )}
        </div>
      </div>
    </div>
  );
}
