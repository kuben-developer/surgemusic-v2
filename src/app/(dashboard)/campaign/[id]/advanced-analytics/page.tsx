import { AdvancedAnalyticsPage } from "@/features/campaign/analytics-v2/AdvancedAnalyticsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdvancedAnalyticsPage campaignId={id} />;
}
