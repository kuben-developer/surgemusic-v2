import { AlertCircle, Ban, Clock, Link2Off, Server } from 'lucide-react';
import type { PublicReportErrorType } from '../types';

export interface ErrorUIConfig {
  icon: React.ReactNode;
  title: string;
}

/**
 * Maps error types to their corresponding UI configuration
 */
export const getErrorUIConfig = (errorType: PublicReportErrorType): ErrorUIConfig => {
  const configs: Record<PublicReportErrorType, ErrorUIConfig> = {
    NOT_FOUND: {
      icon: <Ban className="h-6 w-6" />,
      title: "Report Not Found"
    },
    EXPIRED: {
      icon: <Clock className="h-6 w-6" />,
      title: "Share Link Expired"
    },
    NETWORK: {
      icon: <Link2Off className="h-6 w-6" />,
      title: "Network Error"
    },
    SERVER_ERROR: {
      icon: <Server className="h-6 w-6" />,
      title: "Server Error"
    },
    UNKNOWN: {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "Error"
    }
  };

  return configs[errorType];
};

/**
 * Determines retry button text based on retry count and max retries
 */
export const getRetryButtonText = (retryCount: number, maxRetries: number): string => {
  if (retryCount >= maxRetries) {
    return "Too Many Retries";
  }
  
  return retryCount > 0 ? `Try Again (${retryCount}/${maxRetries})` : 'Try Again';
};