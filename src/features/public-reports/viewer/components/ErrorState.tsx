'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import type { ErrorStateProps } from '../types';
import { 
  getErrorType, 
  isRecoverableError, 
  getErrorRecoveryMessage 
} from '../utils/error-handling.utils';
import { getErrorUIConfig, getRetryButtonText } from '../utils/error-ui.utils';
import { MAX_RETRIES } from '../constants/metrics.constants';

export function ErrorState({ error, onRetry, retryCount }: ErrorStateProps) {
  const router = useRouter();
  const errorType = getErrorType(error);
  const canRetry = isRecoverableError(errorType);

  const { icon, title } = getErrorUIConfig(errorType);
  const description = getErrorRecoveryMessage(errorType);

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
            {canRetry && (
              <Button
                onClick={onRetry}
                disabled={retryCount >= MAX_RETRIES}
              >
                {getRetryButtonText(retryCount, MAX_RETRIES)}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}