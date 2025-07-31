import { useState } from 'react';
import { toast } from 'sonner';

interface UseAnalyticsRefreshOptions {
  onRefresh: () => Promise<void>;
}

interface UseAnalyticsRefreshReturn {
  isRefreshing: boolean;
  refreshAnalytics: () => Promise<void>;
}

export function useAnalyticsRefresh({ onRefresh }: UseAnalyticsRefreshOptions): UseAnalyticsRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAnalytics = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success("Analytics refreshed", {
        description: "Latest data has been loaded",
      });
    } catch (error) {
      console.error("Error refreshing analytics:", error);
      toast.error("Error refreshing analytics", {
        description: "Could not load latest data. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    refreshAnalytics,
  };
}