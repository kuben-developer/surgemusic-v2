import { AnalyticsContainer } from '@/features/analytics';

export default function MainAnalyticsPage() {
  return (
    <AnalyticsContainer
      type="main"
      title="Analytics Overview"
      showCampaignSelector={true}
      showCommentsSection={true}
      showExportButton={true}
    />
  );
} 