import {
    BarChart2,
    Eye,
    Heart,
    MessageSquare,
    Share2,
    TrendingUp
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import type { GrowthData, Totals } from "@/types/analytics.types";

interface KpiMetricsGridProps {
    campaignsCount: number;
    totalVideos: number;
    totals: Totals;
    viewsGrowth: GrowthData;
    likesGrowth: GrowthData;
    commentsGrowth: GrowthData;
    // sharesGrowth: GrowthData; // Add if needed
    engagementGrowth: GrowthData;
    avgEngagementRate: string;
    sharesGrowth?: GrowthData;
}

export function KpiMetricsGrid({
    campaignsCount,
    totalVideos,
    totals,
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    engagementGrowth,
    avgEngagementRate,
    sharesGrowth
}: KpiMetricsGridProps) {
    return (
        <section
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
        >
            <KpiCard
                title="Total Campaigns"
                value={campaignsCount}
                icon={<TrendingUp />}
                iconBgColor="bg-blue-100 dark:bg-blue-900/20"
                iconTextColor="text-blue-600 dark:text-blue-400"
            />
            <KpiCard
                title="Total Posts"
                value={totalVideos}
                icon={<BarChart2 />}
                iconBgColor="bg-violet-100 dark:bg-violet-900/20"
                iconTextColor="text-violet-600 dark:text-violet-400"
            />
            <KpiCard
                title="Total Views"
                value={totals.views}
                icon={<Eye />}
                growth={viewsGrowth}
                iconBgColor="bg-emerald-100 dark:bg-emerald-900/20"
                iconTextColor="text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard
                title="Total Likes"
                value={totals.likes}
                icon={<Heart />}
                growth={likesGrowth}
                iconBgColor="bg-amber-100 dark:bg-amber-900/20"
                iconTextColor="text-amber-600 dark:text-amber-400"
            />
            <KpiCard
                title="Total Comments"
                value={totals.comments}
                icon={<MessageSquare />}
                growth={commentsGrowth}
                iconBgColor="bg-red-100 dark:bg-red-900/20"
                iconTextColor="text-red-600 dark:text-red-400"
            />
            <KpiCard
                title="Total Shares"
                value={totals.shares}
                icon={<Share2 />}
                growth={sharesGrowth}
                iconBgColor="bg-indigo-100 dark:bg-indigo-900/20"
                iconTextColor="text-indigo-600 dark:text-indigo-400"
            />
        </section>
    );
} 