import { Eye, Heart, MessageSquare, Share2 } from "lucide-react";
import type { MetricInfo } from "../types/analytics.types";

// Metric info for consistent styling and icons
export const METRIC_INFO: Record<string, MetricInfo> = {
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

// Animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const chartVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};