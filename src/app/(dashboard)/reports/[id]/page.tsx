import { AnalyticsContainer } from '@/features/analytics';

interface ReportAnalyticsPageProps {
  params: {
    id: string;
  };
}

export default function ReportAnalyticsPage({ params }: ReportAnalyticsPageProps) {
  return (
    <div className="container relative">
      <AnalyticsContainer
        type="report"
        entityId={params.id}
        title="Report Analytics"
        showCommentsSection={true}
        showExportButton={true}
      />
    </div>
  );
} 