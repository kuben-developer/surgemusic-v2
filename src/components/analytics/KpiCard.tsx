import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import React from "react";

interface GrowthData {
    value: number;
    isPositive: boolean;
}

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
        <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className={`h-8 w-8 rounded-full ${iconBgColor} flex items-center justify-center`}>
                    {React.cloneElement(icon as React.ReactElement, { className: `h-4 w-4 ${iconTextColor}` })}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                {growth && growth.value > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                        <ArrowUpRight className={`h-3 w-3 ${growth.isPositive ? 'text-green-600 dark:text-green-400' : 'rotate-180 text-red-600 dark:text-red-400'}`} />
                        <span className={growth.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {growth.value}%
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
}

// Re-export GrowthData type if needed
export type { GrowthData }; 