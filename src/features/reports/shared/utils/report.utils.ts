import type { GrowthData } from "../types/report.types";

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};

export const calculateGrowth = (data: Array<Record<string, number>>, metricKey: string): GrowthData => {
    if (!data || data.length < 2) return { value: 0, isPositive: true };

    const recent = data.slice(-7);
    const previous = data.slice(-14, -7);

    const recentSum = recent.reduce((sum, day) => sum + (day[metricKey] ?? 0), 0);
    const previousSum = previous.reduce((sum, day) => sum + (day[metricKey] ?? 0), 0);

    if (previousSum === 0) return { value: 0, isPositive: true };

    const growth = ((recentSum - previousSum) / previousSum) * 100;
    return {
        value: Math.abs(Math.round(growth)),
        isPositive: growth >= 0
    };
};