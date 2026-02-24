"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalibrationStatusBadge } from "../../shared/components/StatusBadge";
import { Loader2, ScanSearch, Settings2 } from "lucide-react";
import {
  DEFAULT_SCENE_THRESHOLD,
  DEFAULT_CLUSTER_THRESHOLD,
} from "../../shared/constants/podcast-clipper.constants";
import type {
  PodcastClipperVideo,
  PodcastClipperSceneType,
  PodcastFolderId,
} from "../../shared/types/podcast-clipper.types";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface CalibrationSectionProps {
  folderId: PodcastFolderId;
  calibrationStatus: string;
  videos: PodcastClipperVideo[];
  sceneTypes: PodcastClipperSceneType[] | undefined;
  onStartCalibration: (
    referenceVideoId: Id<"podcastClipperVideos">,
    sceneThreshold?: number,
    clusterThreshold?: number
  ) => Promise<void>;
}

export function CalibrationSection({
  folderId,
  calibrationStatus,
  videos,
  sceneTypes,
  onStartCalibration,
}: CalibrationSectionProps) {
  const router = useRouter();
  const [referenceVideoId, setReferenceVideoId] = useState<string>("");
  const [sceneThreshold, setSceneThreshold] = useState(DEFAULT_SCENE_THRESHOLD);
  const [clusterThreshold, setClusterThreshold] = useState(DEFAULT_CLUSTER_THRESHOLD);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCalibrate = async () => {
    if (!referenceVideoId) return;
    setIsCalibrating(true);
    try {
      await onStartCalibration(
        referenceVideoId as Id<"podcastClipperVideos">,
        sceneThreshold,
        clusterThreshold
      );
    } finally {
      setIsCalibrating(false);
    }
  };

  const uploadedVideos = videos.filter((v) => v.status === "uploaded");

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanSearch className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Calibration</h3>
        </div>
        <CalibrationStatusBadge status={calibrationStatus} />
      </div>

      {calibrationStatus === "none" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Select a reference video to detect camera angles. This video should contain all the
            different camera shots used in your podcast.
          </p>
          <div className="space-y-2">
            <Label>Reference Video</Label>
            <Select value={referenceVideoId} onValueChange={setReferenceVideoId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a video..." />
              </SelectTrigger>
              <SelectContent>
                {uploadedVideos.map((video) => (
                  <SelectItem key={video._id} value={video._id}>
                    {video.videoName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings2 className="h-3.5 w-3.5 mr-1" />
            {showAdvanced ? "Hide" : "Show"} Advanced Settings
          </Button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Scene Threshold</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={sceneThreshold}
                  onChange={(e) => setSceneThreshold(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cluster Threshold</Label>
                <Input
                  type="number"
                  step="0.05"
                  value={clusterThreshold}
                  onChange={(e) => setClusterThreshold(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleCalibrate}
            disabled={!referenceVideoId || isCalibrating || uploadedVideos.length === 0}
          >
            {isCalibrating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              "Start Calibration"
            )}
          </Button>
        </div>
      )}

      {calibrationStatus === "pending" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Detecting camera angles... This may take a few minutes.
        </div>
      )}

      {calibrationStatus === "detected" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {sceneTypes?.length ?? 0} camera angle(s) detected. Configure crop regions for each angle.
          </p>
          <Button onClick={() => router.push(`/podcast-clipper/${folderId}/calibrate`)}>
            Configure Crops
          </Button>
        </div>
      )}

      {calibrationStatus === "configured" && (
        <div className="space-y-3">
          <p className="text-sm text-green-600">
            Crop regions configured for {sceneTypes?.length ?? 0} camera angle(s). Ready to reframe.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/podcast-clipper/${folderId}/calibrate`)}
          >
            Edit Crops
          </Button>
        </div>
      )}
    </div>
  );
}
