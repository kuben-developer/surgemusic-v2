import { Eye, Heart, MessageSquare, Share2 } from 'lucide-react';
import type { MetricKey, MetricInfo } from '../../shared/types';

export const metricInfo: Record<MetricKey, MetricInfo> = {
  views: {
    label: "Views",
    icon: <Eye className="h-4 w-4" />,
    color: "#10B981",
    description: "Total number of content views"
  },
  likes: {
    label: "Likes",
    icon: <Heart className="h-4 w-4" />,
    color: "#F59E0B",
    description: "Engagement through likes"
  },
  comments: {
    label: "Comments",
    icon: <MessageSquare className="h-4 w-4" />,
    color: "#EF4444",
    description: "User feedback and comments"
  },
  shares: {
    label: "Shares",
    icon: <Share2 className="h-4 w-4" />,
    color: "#3B82F6",
    description: "Content redistribution"
  }
};