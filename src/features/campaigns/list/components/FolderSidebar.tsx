"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Folder, 
  Plus, 
  Check, 
  X, 
  ChevronRight,
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolderSidebarProps } from "../types/folder-sidebar.types";

export function FolderSidebar({
  folders,
  isLoading,
  selectedFolderId,
  onFolderSelect,
  showCreateForm,
  setShowCreateForm,
  newFolderName,
  setNewFolderName,
  isCreating,
  onCreateFolder,
}: FolderSidebarProps) {
  return (
    <div className="w-80 border-r bg-muted/30">
      {/* Folder Header */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Folders</h3>
          <Badge variant="outline" className="text-xs">
            {folders?.length || 0}
          </Badge>
        </div>
        
        {/* Create Folder Button */}
        {!showCreateForm ? (
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  onCreateFolder();
                } else if (e.key === 'Escape') {
                  setShowCreateForm(false);
                  setNewFolderName("");
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={onCreateFolder}
                disabled={!newFolderName.trim() || isCreating}
                size="sm"
                className="flex-1"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFolderName("");
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Folder List */}
      <ScrollArea className="h-[500px]">
        <div className="p-2">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg mb-2">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          ) : folders && folders.length > 0 ? (
            // Folder list
            folders.map((folder) => (
              <div
                key={folder._id}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedFolderId === folder._id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onFolderSelect(folder._id)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Folder className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs opacity-70">
                      {folder.campaignCount} campaign{folder.campaignCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {selectedFolderId === folder._id && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
              </div>
            ))
          ) : (
            // Empty state
            <div className="text-center py-12 px-4">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">No folders yet</p>
              <p className="text-xs text-muted-foreground">
                Create your first folder to organize campaigns
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}