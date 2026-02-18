import { AnalyticsV2Page } from "@/features/campaign/analytics-v2";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnalyticsV2Page campaignId={id} />;
}
