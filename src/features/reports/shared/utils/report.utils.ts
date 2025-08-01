// Re-export shared utilities for backward compatibility
export { calculateWeeklyGrowth as calculateGrowth } from '@/utils/analytics';

export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};