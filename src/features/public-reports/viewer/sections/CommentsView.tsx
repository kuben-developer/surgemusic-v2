'use client';

import { motion } from "framer-motion";
import { CommentsSection } from '@/features/analytics/components/CommentsSection';
import { useComments } from '@/features/analytics/hooks/useComments';

interface CommentsViewProps {
  campaignIds: string[] | undefined;
}

export function CommentsView({ campaignIds }: CommentsViewProps) {
  // Fetch comments from database
  const comments = useComments({
    campaignIds: campaignIds || [],
  });

  if (!campaignIds || campaignIds.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CommentsSection
        comments={comments.data}
        groupedComments={comments.groupedComments}
        isLoading={comments.isLoading}
        page={comments.page}
        onPageChange={comments.setPage}
        totalPages={comments.totalPages}
        totalComments={comments.totalComments}
        onRefresh={comments.refresh}
      />
    </motion.div>
  );
}