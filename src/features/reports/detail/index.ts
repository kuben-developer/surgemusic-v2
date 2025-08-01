export { default as ReportDetailPage } from './ReportDetailPage';

// Export the new components and hooks
export { ReportAnalyticsClient } from './components/ReportAnalyticsClient';
export { ReportHeader } from './components/ReportHeader';
export { DeleteReportDialog } from './components/DeleteReportDialog';
export { ShareReportDialog } from './components/ShareReportDialog';
export { LoadingSkeleton, ErrorState, ReportNotFound, NoCampaignsState } from './components/ReportLoadingStates';

export { useReportAnalyticsData } from './hooks/useReportAnalyticsData';
export { useReportActions } from './hooks/useReportActions';