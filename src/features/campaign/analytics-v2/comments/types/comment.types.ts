import type { Doc, Id } from "../../../../../../convex/_generated/dataModel";

// Base type from schema
export type TikTokCommentDoc = Doc<"tiktokComments">;

// Type returned by queries (with resolved profile picture URL)
export type TikTokComment = TikTokCommentDoc & {
  authorProfilePictureUrl: string | null;
};

export interface CommentForDisplay {
  _id: Id<"tiktokComments">;
  commentId: string;
  postId: string;
  campaignId: string;
  text: string;
  likes: number;
  createdAt: number;
  authorUsername: string;
  authorNickname: string;
  authorProfilePictureUrl: string | null;
  authorCountry?: string;
  isSelected: boolean;
  selectedAt?: number;
  scrapedAt: number;
  updatedAt: number;
}

export type CommentSortBy = "likes" | "createdAt";
export type CommentSortOrder = "asc" | "desc";

export interface CommentScrapeProgress {
  totalVideos: number;
  processedVideos: number;
  totalCommentsScraped: number;
  totalCommentsUpdated: number;
}

export interface CommentScrapeStatus {
  totalComments: number;
  selectedCount: number;
  lastScrapedAt: number | null;
  activeJob: {
    status: "pending" | "in_progress";
    progress: CommentScrapeProgress;
    startedAt: number;
  } | null;
}

export interface CommentsForCurationResponse {
  comments: TikTokComment[];
  totalCount: number;
  selectedCount: number;
  hasMore: boolean;
}
