import { Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyContentStateProps {
  title?: string;
  description?: string;
}

export function EmptyContentState({ 
  title = "No Content Available",
  description = "There's no content data available for the selected report and time period." 
}: EmptyContentStateProps) {
  return (
    <Card className="p-6 border border-primary/10">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Top Performing Content</h3>
        <p className="text-sm text-muted-foreground">No videos found for this report</p>
      </div>
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="text-lg font-medium mb-2">{title}</h4>
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      </div>
    </Card>
  );
}