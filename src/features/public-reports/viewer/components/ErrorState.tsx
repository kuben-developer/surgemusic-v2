import { AlertCircle, Ban, Clock, Link2Off, Server } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import type { ErrorStateProps } from '../../shared/types';
import { getErrorType } from '../../shared/utils/error-handling.utils';

export function ErrorState({ error, onRetry, retryCount }: ErrorStateProps) {
  const router = useRouter();
  const errorType = getErrorType(error);

  let icon = <AlertCircle className="h-6 w-6" />;
  let title = "Error";
  let description = "An error occurred while loading the report.";

  switch (errorType) {
    case 'NOT_FOUND':
      icon = <Ban className="h-6 w-6" />;
      title = "Report Not Found";
      description = "The shared report you're looking for doesn't exist or has been deleted.";
      break;
    case 'EXPIRED':
      icon = <Clock className="h-6 w-6" />;
      title = "Share Link Expired";
      description = "This report share link has expired or been revoked by the owner.";
      break;
    case 'NETWORK':
      icon = <Link2Off className="h-6 w-6" />;
      title = "Network Error";
      description = "Unable to connect to the server. Please check your internet connection.";
      break;
    case 'SERVER_ERROR':
      icon = <Server className="h-6 w-6" />;
      title = "Server Error";
      description = "Our server encountered an issue. The team has been notified.";
      break;
  }

  return (
    <div className="container max-w-xl mx-auto py-8">
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            {icon}
          </div>
          <AlertTitle className="text-xl font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {error?.message || description}
          </AlertDescription>
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/public/reports')}
            >
              Back to Reports
            </Button>
            <Button
              onClick={onRetry}
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? "Too Many Retries" : "Try Again"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}