import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook for report navigation actions
 */
export const useReportNavigation = () => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push('/public/reports');
  }, [router]);

  const handleRetry = useCallback((refetch: () => void) => {
    refetch();
    toast.info("Retrying to fetch report data...");
  }, []);

  return {
    handleBack,
    handleRetry
  };
};