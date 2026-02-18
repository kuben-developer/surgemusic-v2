"use client";

import { motion } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { CommentItem } from "./CommentItem";
import { fadeInUp } from "../../constants/metrics-v2";

interface SelectedCommentsDisplayProps {
  campaignId: string;
}

export function SelectedCommentsDisplay({ campaignId }: SelectedCommentsDisplayProps) {
  // Fetch selected comments (sorted by likes desc by default on the server)
  const comments = useQuery(api.app.comments.getSelectedComments, {
    campaignId,
    sortBy: "likes",
    sortOrder: "desc",
  });

  const isLoading = comments === undefined;
  const totalCount = comments?.length ?? 0;

  // Don't render if loading
  if (isLoading) {
    return (
      <motion.div variants={fadeInUp}>
        <Card className="p-4 sm:p-6 border border-primary/10">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </Card>
      </motion.div>
    );
  }

  // Don't render if no selected comments
  if (totalCount === 0) {
    return null;
  }

  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-colors">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Top Comments</h3>
            <p className="text-xs text-muted-foreground">
              Fan reactions from the campaign
            </p>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              isSelectable={false}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
