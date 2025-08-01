'use client';

import { motion } from "framer-motion";
import { CommentsSection as AnalyticsCommentsSection } from "@/components/analytics/CommentsSection";
import { fadeInUp } from '../../constants/metrics.constants';
import type { CampaignFilterProps } from '@/types/analytics.types';

interface CommentsSectionProps extends CampaignFilterProps {}

/**
 * Comments section component
 * Displays comments analytics for selected campaigns
 */
export function CommentsSection(props: CommentsSectionProps) {
  const { selectedCampaigns, campaigns } = props;
  // Determine campaign IDs to show comments for
  const campaignIds = selectedCampaigns.length > 0 
    ? selectedCampaigns 
    : campaigns.map((campaign) => campaign._id).filter(Boolean);

  return (
    <motion.div variants={fadeInUp}>
      <AnalyticsCommentsSection campaignIds={campaignIds} />
    </motion.div>
  );
}