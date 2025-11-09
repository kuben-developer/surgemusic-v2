import { CampaignAnalyticsPage } from '@/features/campaign/analytics';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignAnalyticsPage campaignId={id} />;
}
