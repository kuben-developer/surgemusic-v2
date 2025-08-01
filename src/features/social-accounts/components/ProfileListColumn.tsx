import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { ProfileCheckResult } from '../types/social-accounts.types';

interface ProfileItemProps {
  result: ProfileCheckResult;
  index: number;
  onRef: (el: HTMLDivElement | null, index: number) => void;
}

function ProfileItem({ result, index, onRef }: ProfileItemProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div 
      ref={el => onRef(el, index)}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
    >
      <div className="flex items-center gap-1.5">
        {getStatusIcon()}
        <span className="font-medium text-sm">{result.profileName}</span>
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{result.message}</span>
    </div>
  );
}

interface ProfileListColumnProps {
  title: string;
  icon: React.ReactNode;
  profiles: ProfileCheckResult[];
  emptyMessage: string;
  onRefCallback: (el: HTMLDivElement | null, index: number) => void;
  showEmptyForZeroLength?: boolean;
}

export function ProfileListColumn({ 
  title, 
  icon, 
  profiles, 
  emptyMessage, 
  onRefCallback,
  showEmptyForZeroLength = true
}: ProfileListColumnProps) {
  const shouldShowEmpty = showEmptyForZeroLength || profiles.length === 0;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      <div className="border rounded-md">
        <div className="space-y-0.5 p-1 max-h-[30vh] overflow-y-auto">
          {profiles.map((result, index) => (
            <ProfileItem
              key={`${title.toLowerCase()}-${index}`}
              result={result}
              index={index}
              onRef={onRefCallback}
            />
          ))}
          {shouldShowEmpty && profiles.length === 0 && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}