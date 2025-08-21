import { AnalyticsContainer } from '@/features/analytics';

interface CampaignAnalyticsPageProps {
  params: {
    id: string;
  };
}

export default function CampaignAnalyticsPage({ params }: CampaignAnalyticsPageProps) {
  return (
    <AnalyticsContainer
      type="campaign"
      entityId={params.id}
      title="Campaign Analytics"
      showCommentsSection={true}
      showExportButton={true}
    />
  );
}