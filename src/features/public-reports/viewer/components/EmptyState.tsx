import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { EmptyStateProps } from '../../shared/types';

export function EmptyState({ onBack }: EmptyStateProps) {
  return (
    <div className="container max-w-xl mx-auto py-8">
      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <AlertTitle className="text-xl font-semibold">No Data Available</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            This report doesn't contain any data or may have been deleted.
          </AlertDescription>
          <Button
            variant="outline"
            onClick={onBack}
            className="mt-4"
          >
            Back to Reports
          </Button>
        </div>
      </Card>
    </div>
  );
}