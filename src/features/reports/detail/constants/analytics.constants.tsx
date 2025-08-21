import {
    Eye,
    Heart,
    MessageSquare,
    Share2,
} from "lucide-react";
import type { MetricKey, MetricInfo } from "../../shared/types/report.types";

// Animation variants for framer-motion
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

// Metric info for consistent styling and icons
export const metricInfo: Record<MetricKey, MetricInfo> = {
    views: {
        label: "Views",
        icon: <Eye className="h-4 w-4" />,
        color: "#3B82F6",
        description: "Total video views"
    },
    likes: {
        label: "Likes",
        icon: <Heart className="h-4 w-4" />,
        color: "#EF4444",
        description: "Total likes received"
    },
    comments: {
        label: "Comments",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "#10B981",
        description: "Total comments received"
    },
    shares: {
        label: "Shares",
        icon: <Share2 className="h-4 w-4" />,
        color: "#A855F7",
        description: "Total shares received"
    }
};

// Default pagination settings
export const ITEMS_PER_PAGE = 5;