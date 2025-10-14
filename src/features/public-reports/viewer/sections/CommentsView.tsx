'use client';

import { motion } from "framer-motion";
import { CommentsSection } from '@/features/analytics/components/CommentsSection';
import { usePublicComments } from '../hooks/usePublicComments';

interface CommentsViewProps {
  shareId: string;
}

export function CommentsView({ shareId }: CommentsViewProps) {
  // Fetch comments from database using public API
  const comments = usePublicComments({
    shareId,
  });

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
        error={comments.error}
        page={comments.page}
        onPageChange={comments.setPage}
        totalPages={comments.totalPages}
        totalComments={comments.totalComments}
        onRefresh={comments.refresh}
      />
    </motion.div>
  );
}