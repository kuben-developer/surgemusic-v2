import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VALID_SHARE_ID_REGEX } from '../constants/metrics.constants';

/**
 * Custom hook to validate share ID format and handle invalid cases
 * @param shareId The share ID to validate
 */
export const useShareIdValidation = (shareId: string) => {
  const router = useRouter();

  useEffect(() => {
    if (shareId && !VALID_SHARE_ID_REGEX.test(shareId)) {
      toast.error("Invalid share ID format");
      router.push('/public/reports');
    }
  }, [shareId, router]);
};