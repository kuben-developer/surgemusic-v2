import { motion } from "framer-motion";
import { CommentsSection as AnalyticsCommentsSection } from "@/components/analytics/CommentsSection";
import { fadeInUp } from '../../constants/metrics.constants';

interface CommentsSectionProps {
  selectedCampaigns: string[];
  campaigns: any[];
}

/**
 * Comments section component
 * Displays comments analytics for selected campaigns
 */
export function CommentsSection({ 
  selectedCampaigns, 
  campaigns 
}: CommentsSectionProps) {
  // Determine campaign IDs to show comments for
  const campaignIds = selectedCampaigns.length > 0 
    ? selectedCampaigns 
    : campaigns.map((c: any) => c._id);

  return (
    <motion.div variants={fadeInUp}>
      <AnalyticsCommentsSection campaignIds={campaignIds} />
    </motion.div>
  );
}