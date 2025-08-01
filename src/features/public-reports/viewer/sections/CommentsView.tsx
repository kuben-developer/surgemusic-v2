'use client';

import { motion } from "framer-motion";
import { CommentsSection } from '@/components/analytics/CommentsSection';

interface CommentsViewProps {
  campaignIds: string[] | undefined;
}

export function CommentsView({ campaignIds }: CommentsViewProps) {
  if (!campaignIds || campaignIds.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CommentsSection campaignIds={campaignIds} />
    </motion.div>
  );
}