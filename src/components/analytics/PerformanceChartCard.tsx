import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ArrowUpRight } from "lucide-react";
import React from "react";
import type { GrowthData } from "./KpiCard"; // Assuming GrowthData is exported from KpiCard

// Define metric info structure
interface MetricInfoData {
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

// Explicitly define the keys for metricInfo
type MetricKey = 'views' | 'likes' | 'comments' | 'shares';

// Define daily data structure
interface DailyData {
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    [key: string]: number | string; // Allow indexing by string
}

// Define totals structure
interface Totals {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    [key: string]: number; // Allow indexing by string
}

interface PerformanceChartCardProps {
    dailyData: DailyData[];
    totals: Totals;
    activeMetric: MetricKey;
    setActiveMetric: (metric: MetricKey) => void;
    metricInfo: Record<MetricKey, MetricInfoData>; // Use MetricKey and MetricInfoData
    dateRange: string;
    viewsGrowth: GrowthData;
    likesGrowth: GrowthData;
    commentsGrowth: GrowthData;
    sharesGrowth: GrowthData;
}

const chartVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function PerformanceChartCard({
    dailyData,
    totals,
    activeMetric,
    setActiveMetric,
    metricInfo,
    dateRange,
    viewsGrowth,
    likesGrowth,
    commentsGrowth,
    sharesGrowth
}: PerformanceChartCardProps) {

    const getGrowthForMetric = (metric: MetricKey): GrowthData => {
        switch (metric) {
            case 'views': return viewsGrowth;
            case 'likes': return likesGrowth;
            case 'comments': return commentsGrowth;
            case 'shares': return sharesGrowth;
            default: // Should not happen with MetricKey, but good practice
                const _exhaustiveCheck: never = metric;
                return { value: 0, isPositive: true };
        }
    };

    const activeGrowth = getGrowthForMetric(activeMetric);

    return (
        <Card className="p-6 border border-primary/10 shadow-md overflow-hidden">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Performance Metrics</h3>
                    <Badge variant="outline" className="bg-primary/5 text-primary">
                        {dateRange} Day Trend
                    </Badge>
                </div>

                {/* Metric Info Display */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: `${metricInfo[activeMetric].color}20` }}>
                        <div className="flex items-center justify-center h-6 w-6" style={{ color: metricInfo[activeMetric].color }}>
                             {/* Clone element to ensure icon styles are applied if needed, or just render directly */}
                             {React.isValidElement(metricInfo[activeMetric].icon) ? metricInfo[activeMetric].icon : null}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium">{metricInfo[activeMetric].label}</h4>
                        <p className="text-xs text-muted-foreground">{metricInfo[activeMetric].description}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-4 bg-muted/50 rounded-lg p-1 backdrop-blur-sm">
                    {(Object.keys(metricInfo) as MetricKey[]).map((metric) => (
                        <button
                            key={metric}
                            className={cn(
                                "flex-1 py-2 px-3 text-sm rounded-md transition-all relative overflow-hidden",
                                activeMetric === metric
                                    ? "text-white font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setActiveMetric(metric)}
                        >
                            {activeMetric === metric && (
                                <motion.div
                                    className="absolute inset-0 rounded-md -z-10"
                                    layoutId="activeTab"
                                    style={{ backgroundColor: metricInfo[metric].color }}
                                    initial={false}
                                />
                            )}
                            <div className="flex items-center justify-center gap-2">
                                {metricInfo[metric].icon}
                                <span>{metricInfo[metric].label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <motion.div
                className="h-80 bg-white dark:bg-muted/30 rounded-lg p-4 border border-border/30 shadow-sm"
                key={activeMetric} // Re-render on metric change for animation
                variants={chartVariants}
                initial="hidden"
                animate="visible"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor={metricInfo[activeMetric].color}
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={metricInfo[activeMetric].color}
                                    stopOpacity={0.2}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700 stroke-gray-200" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            className="dark:fill-gray-400 fill-gray-500"
                            tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
                            axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                            tickLine={false}
                        />
                        <YAxis
                            className="dark:fill-gray-400 fill-gray-500"
                            tick={{ className: "dark:fill-gray-400 fill-gray-500", fontSize: 12 }}
                            axisLine={{ className: "dark:stroke-gray-700 stroke-gray-300" }}
                            tickLine={false}
                            width={40} // Adjust width as needed for Y-axis labels
                            tickFormatter={(value) => value.toLocaleString()} // Format Y-axis ticks
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                padding: '8px 12px',
                                color: 'var(--foreground)'
                            }}
                            labelStyle={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: '4px' }}
                            itemStyle={{ color: 'var(--foreground)', fontSize: 14 }}
                            formatter={(value: number, name: MetricKey) => [value.toLocaleString(), metricInfo[name]?.label ?? name]}
                            labelFormatter={(date: string) => new Date(date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        />
                        <Area
                            type="monotone"
                            dataKey={activeMetric}
                            stroke={metricInfo[activeMetric].color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorGradient)"
                            activeDot={{
                                r: 6,
                                stroke: metricInfo[activeMetric].color,
                                strokeWidth: 2,
                                fill: 'var(--background)'
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Total</div>
                    <div className="text-lg font-semibold">{totals[activeMetric].toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Average</div>
                    <div className="text-lg font-semibold">
                        {Math.round(
                            dailyData.reduce((sum, day) => sum + (day[activeMetric] as number), 0) /
                            (dailyData.length || 1)
                        ).toLocaleString()}
                    </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground mb-1">Trend</div>
                    <div className="flex items-center gap-1">
                        {activeGrowth.value === 0 ? (
                             <span className="text-lg font-semibold">--</span>
                        ) : (
                            <>
                                <ArrowUpRight className={`h-4 w-4 ${activeGrowth.isPositive ? 'text-green-500' : 'rotate-180 text-red-500'}`} />
                                <span className={`text-lg font-semibold ${activeGrowth.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {activeGrowth.isPositive ? '+' : '-'}{activeGrowth.value}%
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Re-export types if needed
export type { DailyData, MetricInfoData as MetricInfo, Totals, MetricKey }; 