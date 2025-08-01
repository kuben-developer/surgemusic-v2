import type { PublicReportErrorType, PublicReportError } from '../types';

export const getErrorType = (error: PublicReportError | null): PublicReportErrorType => {
  if (!error) return 'UNKNOWN';

  const message = error.message?.toLowerCase() || '';
  const status = error.status;

  // Check HTTP status codes first for more reliable error detection
  if (status === 404) {
    return 'NOT_FOUND';
  } else if (status === 403 || status === 401) {
    return 'EXPIRED';
  } else if (status && status >= 500) {
    return 'SERVER_ERROR';
  }

  // Fallback to message-based detection
  if (message.includes('not found') || message.includes('no such')) {
    return 'NOT_FOUND';
  } else if (message.includes('expired') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'EXPIRED';
  } else if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'NETWORK';
  } else if (message.includes('server') || message.includes('internal')) {
    return 'SERVER_ERROR';
  }

  return 'UNKNOWN';
};

/**
 * Determines if an error is recoverable through retry
 */
export const isRecoverableError = (errorType: PublicReportErrorType): boolean => {
  switch (errorType) {
    case 'NETWORK':
    case 'SERVER_ERROR':
    case 'UNKNOWN':
      return true;
    case 'NOT_FOUND':
    case 'EXPIRED':
      return false;
    default:
      return false;
  }
};

/**
 * Gets retry delay in milliseconds with exponential backoff
 */
export const getRetryDelay = (retryCount: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = baseDelay * Math.pow(2, retryCount);
  return Math.min(delay, maxDelay);
};

/**
 * Gets appropriate error recovery suggestions
 */
export const getErrorRecoveryMessage = (errorType: PublicReportErrorType): string => {
  switch (errorType) {
    case 'NETWORK':
      return 'Check your internet connection and try again.';
    case 'SERVER_ERROR':
      return 'Our servers are experiencing issues. Please try again in a few moments.';
    case 'NOT_FOUND':
      return 'This report may have been deleted or the link is incorrect.';
    case 'EXPIRED':
      return 'Contact the report owner to get a new share link.';
    default:
      return 'Something went wrong. Please try refreshing the page.';
  }
};