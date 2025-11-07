import { CampaignV2AnalyticsPage } from '@/features/campaign-v2/analytics';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignV2AnalyticsPage campaignId={id} />;
}
