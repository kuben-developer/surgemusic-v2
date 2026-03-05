"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeftRight } from "lucide-react";
import { CropCanvas } from "./CropCanvas";
import { KeyframeStrip } from "./KeyframeStrip";
import { getEffectiveCrop } from "../utils/crop.utils";
import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import type { SceneTypeCropState } from "../types/calibration.types";

interface SceneTypeCardProps {
  sceneType: SceneTypeCropState;
  sourceWidth: number;
  sourceHeight: number;
  onCropChange: (crop: CropRegion) => void;
  onAltCropChange: (crop: CropRegion) => void;
  onToggleAltCrop: (enabled: boolean) => void;
  onSelectKeyframe: (index: number | null) => void;
  onKeyframeCropChange: (keyframeIndex: number, crop: CropRegion) => void;
  onKeyframeAltCropChange: (keyframeIndex: number, altCrop: CropRegion) => void;
}

export function SceneTypeCard({
  sceneType,
  sourceWidth,
  sourceHeight,
  onCropChange,
  onAltCropChange,
  onToggleAltCrop,
  onSelectKeyframe,
  onKeyframeCropChange,
  onKeyframeAltCropChange,
}: SceneTypeCardProps) {
  const selectedKfIndex = sceneType.selectedKeyframeIndex;
  const isEditingKeyframe = selectedKfIndex !== null;

  // Determine which frame URL and crop to show
  let activeFrameUrl = sceneType.frameUrl;
  let activeCrop = sceneType.crop;
  let activeAltCrop = sceneType.altCrop;

  if (isEditingKeyframe && sceneType.keyframes[selectedKfIndex]) {
    const kf = sceneType.keyframes[selectedKfIndex];
    activeFrameUrl = kf.frameUrl || sceneType.frameUrl;

    const effective = getEffectiveCrop(
      sceneType.keyframes,
      selectedKfIndex,
      sceneType.crop,
      sceneType.altCrop,
    );
    activeCrop = effective.crop;
    activeAltCrop = effective.altCrop;
  }

  const handleCropChange = (crop: CropRegion) => {
    if (isEditingKeyframe) {
      onKeyframeCropChange(selectedKfIndex, crop);
    } else {
      onCropChange(crop);
    }
  };

  const handleAltCropChange = (altCrop: CropRegion) => {
    if (isEditingKeyframe) {
      onKeyframeAltCropChange(selectedKfIndex, altCrop);
    } else {
      onAltCropChange(altCrop);
    }
  };

  return (
    <Card className="overflow-hidden gap-0 py-0">
      <CardHeader className="px-4 py-2.5 bg-muted/30 border-b [.border-b]:pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
              <Camera className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Camera Angle {sceneType.sceneTypeId + 1}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor={`alt-${sceneType.sceneTypeId}`}
              className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeftRight className="h-3 w-3" />
              Alt Crop
            </Label>
            <Switch
              id={`alt-${sceneType.sceneTypeId}`}
              checked={sceneType.hasAltCrop}
              onCheckedChange={onToggleAltCrop}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="!px-4 py-3 space-y-3">
        {/* Keyframe strip */}
        {sceneType.keyframes.length > 0 && (
          <KeyframeStrip
            keyframes={sceneType.keyframes}
            selectedIndex={sceneType.selectedKeyframeIndex}
            onSelect={onSelectKeyframe}
          />
        )}

        {/* Primary crop */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">Primary Crop</p>
            <div className="flex items-center gap-1.5">
              {isEditingKeyframe && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  keyframe
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
                {activeCrop.width}&times;{activeCrop.height} at ({activeCrop.x}, {activeCrop.y})
              </span>
            </div>
          </div>
          <CropCanvas
            frameUrl={activeFrameUrl}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            crop={activeCrop}
            onCropChange={handleCropChange}
          />
        </div>

        {/* Alt crop */}
        {sceneType.hasAltCrop && activeAltCrop && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Alternating Crop</p>
              <div className="flex items-center gap-1.5">
                {isEditingKeyframe && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    keyframe
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
                  {activeAltCrop.width}&times;{activeAltCrop.height} at ({activeAltCrop.x}, {activeAltCrop.y})
                </span>
              </div>
            </div>
            <CropCanvas
              frameUrl={activeFrameUrl}
              sourceWidth={sourceWidth}
              sourceHeight={sourceHeight}
              crop={activeAltCrop}
              onCropChange={handleAltCropChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
