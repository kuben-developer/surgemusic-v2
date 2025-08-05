"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderOpen, Plus, Archive, Folder, Settings } from "lucide-react";
import { WelcomeView } from "./WelcomeView";
import { cn } from "@/lib/utils";
import type { UseFolderManagerLogicReturn } from "../types/folder-manager.types";
import { AddToFolderTab } from "./AddToFolderTab";
import { ManageFolderTab } from "./ManageFolderTab";
import { CreateFolderDialog } from "../dialogs/CreateFolderDialog";

interface FolderManagerDialogContentProps {
  folderLogic: UseFolderManagerLogicReturn;
  onClose: () => void;
}

export function FolderManagerDialogContent({
  folderLogic,
  onClose,
}: FolderManagerDialogContentProps) {
  const {
    selectedFolderId,
    folders,
    isLoading,
    handleFolderSelect,
  } = folderLogic;

  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <DialogContent className="sm:max-w-[95vw] md:max-w-[1200px] lg:max-w-[1400px] h-[90vh] max-h-[900px] p-0 flex flex-col">
      <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <FolderOpen className="h-6 w-6" />
          Folder Manager
        </DialogTitle>
        <DialogDescription>
          Organize your campaigns into folders for better management
        </DialogDescription>
      </DialogHeader>
      
      {/* Folder Navigation */}
      <div className="px-6 pb-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Select a folder</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Folder
          </Button>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-1">
            {/* Folder buttons */}
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center px-3.5 py-2.5 rounded-lg bg-muted animate-pulse min-w-[120px]"
                >
                  <div className="h-5 w-5 bg-muted-foreground/20 rounded" />
                  <div className="ml-2.5 space-y-1">
                    <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
                    <div className="h-2 w-12 bg-muted-foreground/20 rounded" />
                  </div>
                </div>
              ))
            ) : folders && folders.length > 0 ? (
              folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => handleFolderSelect(folder._id)}
                  className={cn(
                    "flex items-center px-3.5 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap",
                    selectedFolderId === folder._id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                >
                  {selectedFolderId === folder._id ? (
                    <FolderOpen className="h-5 w-5 shrink-0" />
                  ) : (
                    <Folder className="h-5 w-5 shrink-0" />
                  )}
                  <div className="ml-2.5 flex flex-col items-start">
                    <span className="font-medium text-sm leading-tight">
                      {folder.name}
                    </span>
                    <span className="text-xs text-current/70 leading-tight mt-0.5">
                      {folder.campaignIds.length} campaign{folder.campaignIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              ))
            ) : null}
          </div>
        </ScrollArea>
      </div>
      
      {/* Main Content Area - Fixed to use flex-1 and overflow-hidden */}
      <div className="flex-1 overflow-hidden">
        {!selectedFolderId ? (
          <WelcomeView onCreateFolder={() => setShowCreateDialog(true)} />
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "add" | "manage")} className="h-full flex flex-col">
            <div className="px-6 pt-4 flex-shrink-0">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add to Folder
                </TabsTrigger>
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Folder
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="add" className="flex-1 overflow-hidden mt-0">
              <AddToFolderTab folderLogic={folderLogic} />
            </TabsContent>
            
            <TabsContent value="manage" className="flex-1 overflow-hidden mt-0">
              <ManageFolderTab folderLogic={folderLogic} />
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <Separator className="flex-shrink-0" />
      
      <DialogFooter className="px-6 py-4 flex-shrink-0">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
      
      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </DialogContent>
  );
}