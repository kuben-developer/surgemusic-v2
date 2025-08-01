"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

// Loading skeleton component
export function LoadingSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3 mb-4" />
      <div className="h-4 bg-muted rounded w-1/2 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-muted rounded-lg" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Error Loading Report</h1>
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button asChild>
          <Link href="/reports">Back to Reports</Link>
        </Button>
      </div>
    </div>
  );
}

// Report not found state
export function ReportNotFound() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-2">Report Not Found</h1>
      <p className="text-muted-foreground mb-4">Could not load the requested report.</p>
      <Button asChild>
        <Link href="/reports">Back to Reports</Link>
      </Button>
    </div>
  );
}

// No campaigns state
interface NoCampaignsStateProps {
  reportId: string;
  reportName: string;
}

export function NoCampaignsState({ reportId, reportName }: NoCampaignsStateProps) {
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{reportName}</h1>
        <p className="text-muted-foreground mb-6">This report has no campaigns associated with it.</p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href={`/reports/${reportId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Report
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reports">Back to Reports</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}