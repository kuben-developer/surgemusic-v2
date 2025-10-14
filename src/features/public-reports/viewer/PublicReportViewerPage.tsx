'use client';

import { useParams } from 'next/navigation';
import { PublicReportHeader } from './components/PublicReportHeader';
import { PublicReportContent } from './components/PublicReportContent';

export function PublicReportViewerPage() {
  const params = useParams();
  const shareId = params.share_id as string;

  return (
    <>
      <PublicReportHeader />
      <div className="container relative py-4 md:py-6 lg:py-10 px-4 md:px-6">
        <PublicReportContent shareId={shareId} />
      </div>
    </>
  );
}