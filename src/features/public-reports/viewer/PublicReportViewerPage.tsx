'use client';

import { useParams } from 'next/navigation';
import { PublicReportHeader } from '../shared/components/PublicReportHeader';
import { PublicReportContent } from './components/PublicReportContent';

export function PublicReportViewerPage() {
  const params = useParams();
  const shareId = params.share_id as string;

  return (
    <>
      <PublicReportHeader />
      <div className="container relative py-6 md:py-10">
        <PublicReportContent shareId={shareId} />
      </div>
    </>
  );
}