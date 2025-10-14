import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import React from "react";
import type { GrowthData } from "./types";

export { type GrowthData };

interface KpiCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    growth?: GrowthData;
    iconBgColor?: string; // e.g., "bg-emerald-100 dark:bg-emerald-900/20"
    iconTextColor?: string; // e.g., "text-emerald-600 dark:text-emerald-400"
}

export function KpiCard({ title, value, icon, growth, iconBgColor = "bg-gray-100 dark:bg-gray-900/20", iconTextColor = "text-gray-600 dark:text-gray-400" }: KpiCardProps) {
    return (
        <Card className="p-3 md:p-6 space-y-2 md:space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-medium text-muted-foreground truncate pr-2">{title}</h3>
                <div className={`h-7 w-7 md:h-8 md:w-8 rounded-full ${iconBgColor} flex items-center justify-center shrink-0`}>
                    <span className={`flex items-center justify-center h-3.5 w-3.5 md:h-4 md:w-4 ${iconTextColor}`}>
                        {icon}
                    </span>
                </div>
            </div>
            <div className="space-y-0.5 md:space-y-1">
                <p className="text-lg md:text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                {growth && growth.value > 0 && (
                    <div className="flex items-center gap-1 text-[10px] md:text-xs">
                        <ArrowUpRight className={`h-2.5 w-2.5 md:h-3 md:w-3 ${growth.isPositive ? 'text-green-600 dark:text-green-400' : 'rotate-180 text-red-600 dark:text-red-400'}`} />
                        <span className={growth.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {growth.value}%
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
}

