"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useFolders } from "../../list/hooks/useFolders";
import { useMontageCreation } from "../hooks/useMontageCreation";
import { CLIPS_PER_MONTAGE, MAX_MONTAGES_PER_REQUEST } from "../constants/montager.constants";
import { Loader2, Film, FolderOpen } from "lucide-react";
import type { MontagerFolderId, ClipperFolderId } from "../../shared/types/common.types";

interface MontageConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: MontagerFolderId;
  folderName: string;
}

type Step = "select-folders" | "set-count" | "confirm";

export function MontageConfigDialog({
  open,
  onOpenChange,
  folderId,
  folderName,
}: MontageConfigDialogProps) {
  const [step, setStep] = useState<Step>("select-folders");
  const [selectedFolderIds, setSelectedFolderIds] = useState<ClipperFolderId[]>([]);
  const [numberOfMontages, setNumberOfMontages] = useState("1");

  const { folders, isLoading: foldersLoading } = useFolders();
  const { createMontageConfig, isCreating } = useMontageCreation();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep("select-folders");
      setSelectedFolderIds([]);
      setNumberOfMontages("1");
    }
  }, [open]);

  const handleToggleFolder = (folderId: ClipperFolderId) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((f) => f !== folderId)
        : [...prev, folderId]
    );
  };

  const handleNext = () => {
    if (step === "select-folders") {
      if (selectedFolderIds.length === 0) {
        toast.error("Please select at least one clipper folder");
        return;
      }
      setStep("set-count");
    } else if (step === "set-count") {
      const count = parseInt(numberOfMontages, 10);
      if (isNaN(count) || count <= 0) {
        toast.error("Please enter a valid number of montages");
        return;
      }
      if (count > MAX_MONTAGES_PER_REQUEST) {
        toast.error(`Maximum ${MAX_MONTAGES_PER_REQUEST} montages per request`);
        return;
      }
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "set-count") {
      setStep("select-folders");
    } else if (step === "confirm") {
      setStep("set-count");
    }
  };

  const handleCreate = async () => {
    try {
      const count = parseInt(numberOfMontages, 10);

      await createMontageConfig({
        folderId,
        clipperFolderIds: selectedFolderIds,
        numberOfMontages: count,
      });

      onOpenChange(false);
    } catch (error) {
      // Error already handled in hook with toast
    }
  };

  // Get selected folder names for display
  const selectedFolderNames = folders
    ?.filter((f) => selectedFolderIds.includes(f._id))
    .map((f) => f.folderName) ?? [];

  const renderStepContent = () => {
    switch (step) {
      case "select-folders":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Clipper Folders</Label>
              <p className="text-sm text-muted-foreground">
                Choose which clipper folders to pull clips from
              </p>
            </div>

            {foldersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : !folders || folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <FolderOpen className="mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No clipper folders found. Create a clipper folder first.
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border p-4">
                {folders.map((folder) => (
                  <div
                    key={folder._id}
                    className="flex items-center space-x-3 rounded-md p-2 hover:bg-muted"
                  >
                    <Checkbox
                      id={folder._id}
                      checked={selectedFolderIds.includes(folder._id)}
                      onCheckedChange={() => handleToggleFolder(folder._id)}
                    />
                    <label
                      htmlFor={folder._id}
                      className="flex flex-1 cursor-pointer items-center justify-between text-sm"
                    >
                      <span className="font-medium">{folder.folderName}</span>
                      <span className="text-muted-foreground">
                        {folder.clipCount} clips
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {selectedFolderIds.length > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm">
                  <span className="font-medium">{selectedFolderIds.length}</span>{" "}
                  {selectedFolderIds.length === 1 ? "folder" : "folders"} selected
                </p>
              </div>
            )}
          </div>
        );

      case "set-count":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="montage-count">Number of Montages</Label>
              <p className="text-sm text-muted-foreground">
                Each montage will randomly select {CLIPS_PER_MONTAGE} clips from your pool. Clips can be reused.
              </p>
              <Input
                id="montage-count"
                type="number"
                min="1"
                max={MAX_MONTAGES_PER_REQUEST}
                value={numberOfMontages}
                onChange={(e) => setNumberOfMontages(e.target.value)}
                placeholder="Enter number of montages"
              />
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Film className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">Summary</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Selected folders: <span className="font-medium">{selectedFolderNames.join(", ")}</span>
                </p>
                <p>
                  Requested montages:{" "}
                  <span className="font-medium">{numberOfMontages || 0}</span>
                </p>
                <p>
                  Clips per montage:{" "}
                  <span className="font-medium">{CLIPS_PER_MONTAGE} (randomly selected with reuse)</span>
                </p>
              </div>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium">Configuration Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target folder:</span>
                  <span className="font-medium">{folderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source folders:</span>
                  <span className="font-medium">{selectedFolderIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montages to create:</span>
                  <span className="font-medium">{numberOfMontages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clips per montage:</span>
                  <span className="font-medium">{CLIPS_PER_MONTAGE} (random with reuse)</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
              <p className="font-medium mb-1">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Configuration will be saved to database</li>
                <li>External system will randomly select clips from chosen folders</li>
                <li>Montages will be created and uploaded within a few minutes</li>
                <li>Check back here to view your completed montages</li>
              </ol>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Create Montage Configuration
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Step {step === "select-folders" ? "1" : step === "set-count" ? "2" : "3"} of 3)
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === "select-folders" &&
              "Select clipper folders to pull clips from"}
            {step === "set-count" &&
              "Specify how many montages to create"}
            {step === "confirm" &&
              "Review and confirm your configuration"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderStepContent()}</div>

        <DialogFooter>
          {step !== "select-folders" && (
            <Button variant="outline" onClick={handleBack} disabled={isCreating}>
              Back
            </Button>
          )}
          {step !== "confirm" ? (
            <Button
              onClick={handleNext}
              disabled={foldersLoading && step === "select-folders"}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Configuration"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
