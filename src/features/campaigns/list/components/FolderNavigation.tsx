"use client"

import { Folder, FolderOpen } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface FolderItem {
  id: Id<"folders">;
  name: string;
  campaignCount: number;
}

interface ProcessedCampaign {
  _id: string;
  [key: string]: any;
}

interface FolderNavigationProps {
  folders: FolderItem[];
  allCampaigns: ProcessedCampaign[];
  selectedView: 'all' | string;
  onViewChange: (view: 'all' | string) => void;
}

export function FolderNavigation({
  folders,
  allCampaigns,
  selectedView,
  onViewChange,
}: FolderNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {/* All Campaigns Button */}
      <button
        onClick={() => onViewChange('all')}
        className={`
          flex items-center px-3.5 py-2.5 rounded-lg 
          transition-all duration-200 
          ${selectedView === 'all'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted hover:bg-muted/80 text-foreground'
          }
        `}
      >
        {selectedView === 'all' ? (
          <FolderOpen className="h-5 w-5 shrink-0" />
        ) : (
          <Folder className="h-5 w-5 shrink-0" />
        )}
        <div className="ml-2.5 flex flex-col items-start">
          <span className="font-medium text-sm leading-tight">All</span>
          <span className="text-xs text-current/70 leading-tight mt-0.5">
            {allCampaigns.length} Campaign{allCampaigns.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      {/* Individual Folder Buttons */}
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onViewChange(folder.id)}
          className={`
            flex items-center px-3.5 py-2.5 rounded-lg 
            transition-all duration-200 
            ${selectedView === folder.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted hover:bg-muted/80 text-foreground'
            }
          `}
        >
          {selectedView === folder.id ? (
            <FolderOpen className="h-5 w-5 shrink-0" />
          ) : (
            <Folder className="h-5 w-5 shrink-0" />
          )}
          <div className="ml-2.5 flex flex-col items-start">
            <span className="font-medium text-sm leading-tight truncate max-w-[120px]">
              {folder.name}
            </span>
            <span className="text-xs text-current/70 leading-tight mt-0.5">
              {folder.campaignCount} Campaign{folder.campaignCount !== 1 ? 's' : ''}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}