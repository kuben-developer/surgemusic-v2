import type { PublicReportErrorType } from '../types';

export const getErrorType = (error: any): PublicReportErrorType => {
  if (!error) return 'UNKNOWN';

  const message = error.message?.toLowerCase() || '';

  if (message.includes('not found') || message.includes('no such')) {
    return 'NOT_FOUND';
  } else if (message.includes('expired')) {
    return 'EXPIRED';
  } else if (message.includes('network') || message.includes('fetch')) {
    return 'NETWORK';
  } else if (message.includes('server') || message.includes('internal')) {
    return 'SERVER_ERROR';
  }

  return 'UNKNOWN';
};