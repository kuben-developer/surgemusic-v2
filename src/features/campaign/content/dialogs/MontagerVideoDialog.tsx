"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, FolderOpen, Loader2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverlayStyleSelector } from "./OverlayStyleSelector";
import { RenderTypeSelector } from "./RenderTypeSelector";
import { useMontagerVideoAddition } from "../hooks/useMontagerVideoAddition";
import { RENDER_TYPE_OPTIONS } from "../constants/render-types.constants";
import type { MontagerFolder } from "../../shared/types/campaign.types";

interface MontagerVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  airtableRecords: { id: string; date?: string }[];
  campaignId: string;
  categoryName: string;
  onSuccess?: () => void;
}

export function MontagerVideoDialog({
  open,
  onOpenChange,
  airtableRecords,
  campaignId,
  categoryName,
  onSuccess,
}: MontagerVideoDialogProps) {
  const {
    currentStep,
    selectedFolder,
    selectedStyle,
    selectedRenderType,
    isLoading,
    videosNeeded,
    videosToAssign,
    maxVideosToAssign,
    folders,
    foldersLoading,
    setSelectedFolder,
    setSelectedStyle,
    setSelectedRenderType,
    setVideosToAssign,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
  } = useMontagerVideoAddition({
    airtableRecords,
    campaignId,
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const canProceed = () => {
    if (currentStep === "folder") return selectedFolder !== null;
    if (currentStep === "overlay") return selectedStyle !== null;
    if (currentStep === "renderType") return selectedRenderType !== null;
    if (currentStep === "confirm") return true;
    return false;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "folder":
        return "Select Montager Folder";
      case "overlay":
        return "Select Overlay Style";
      case "renderType":
        return "Select Render Type";
      case "confirm":
        return "Confirm & Submit";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "folder":
        return `Select a folder with available videos (need up to ${videosNeeded})`;
      case "overlay":
        return "Choose the visual style for video processing";
      case "renderType":
        return "Choose what content to include in the render";
      case "confirm":
        return "Review your selections and adjust video count if needed";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className="min-h-[300px] py-4">
          {/* Step 1: Select Folder */}
          {currentStep === "folder" && (
            <div className="space-y-3">
              {foldersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : folders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No montager folders found
                </div>
              ) : (
                <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border p-3">
                  {folders.map((folder: MontagerFolder) => {
                    const isSelected = selectedFolder?._id === folder._id;
                    const hasVideos = folder.videoCount >= 1;
                    const hasEnoughForAll = folder.videoCount >= videosNeeded;

                    return (
                      <button
                        key={folder._id}
                        type="button"
                        onClick={() => hasVideos && setSelectedFolder(folder)}
                        disabled={!hasVideos}
                        className={cn(
                          "w-full rounded-md border-2 p-3 text-left transition-all hover:bg-accent",
                          isSelected && "border-primary bg-accent",
                          !isSelected && "border-border",
                          !hasVideos && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "rounded-md p-2",
                                isSelected ? "bg-primary/10" : "bg-muted"
                              )}
                            >
                              <FolderOpen
                                className={cn(
                                  "size-5",
                                  isSelected ? "text-primary" : "text-muted-foreground"
                                )}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{folder.folderName}</div>
                              <div className="text-sm text-muted-foreground">
                                {folder.videoCount} pending video{folder.videoCount === 1 ? "" : "s"}
                              </div>
                            </div>
                          </div>
                          {!hasVideos ? (
                            <span className="text-xs text-destructive font-medium">
                              No videos
                            </span>
                          ) : !hasEnoughForAll ? (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              Partial ({folder.videoCount}/{videosNeeded})
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedFolder && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="font-medium">{selectedFolder.folderName}</span> selected
                  ({selectedFolder.videoCount} videos available)
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Overlay Style */}
          {currentStep === "overlay" && (
            <OverlayStyleSelector
              selectedStyle={selectedStyle}
              onSelectStyle={setSelectedStyle}
            />
          )}

          {/* Step 3: Select Render Type */}
          {currentStep === "renderType" && (
            <RenderTypeSelector
              selectedType={selectedRenderType}
              onSelectType={setSelectedRenderType}
            />
          )}

          {/* Step 4: Confirm */}
          {currentStep === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Category</div>
                  <div className="font-medium">{categoryName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Montager Folder</div>
                  <div className="font-medium">{selectedFolder?.folderName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Overlay Style</div>
                  <div className="font-medium">{selectedStyle}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Render Type</div>
                  <div className="font-medium">
                    {RENDER_TYPE_OPTIONS.find((o) => o.value === selectedRenderType)?.label}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Videos to Assign</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setVideosToAssign(videosToAssign - 1)}
                      disabled={videosToAssign <= 1}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={maxVideosToAssign}
                      value={videosToAssign}
                      onChange={(e) => setVideosToAssign(parseInt(e.target.value) || 1)}
                      className="w-20 text-center h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setVideosToAssign(videosToAssign + 1)}
                      disabled={videosToAssign >= maxVideosToAssign}
                    >
                      <Plus className="size-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      / {maxVideosToAssign} available
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> {videosToAssign} video{videosToAssign === 1 ? "" : "s"} will
                be assigned to the selected Airtable records and marked for processing with the
                selected overlay style.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Step {currentStep === "folder" ? 1 : currentStep === "overlay" ? 2 : currentStep === "renderType" ? 3 : 4} of 4
          </div>
          <div className="flex gap-2">
            {currentStep !== "folder" && (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isLoading}
              >
                <ChevronLeft className="size-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep !== "confirm" ? (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed() || isLoading}
              >
                Next
                <ChevronRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Assigning Videos...
                  </>
                ) : (
                  "Assign Videos"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
