import type { ReportHeaderProps } from '../types';
import { formatReportDate } from '../utils/date-formatting.utils';

export function ReportHeader({ reportName, reportCreatedAt }: ReportHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{reportName}</h1>
      <p className="text-sm md:text-base text-muted-foreground">
        Report created on {formatReportDate(reportCreatedAt)}
      </p>
    </div>
  );
}