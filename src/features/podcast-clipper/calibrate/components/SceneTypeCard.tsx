"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Camera, ArrowLeftRight } from "lucide-react";
import { CropCanvas } from "./CropCanvas";
import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import type { SceneTypeCropState } from "../types/calibration.types";

interface SceneTypeCardProps {
  sceneType: SceneTypeCropState;
  sourceWidth: number;
  sourceHeight: number;
  onCropChange: (crop: CropRegion) => void;
  onAltCropChange: (crop: CropRegion) => void;
  onToggleAltCrop: (enabled: boolean) => void;
}

export function SceneTypeCard({
  sceneType,
  sourceWidth,
  sourceHeight,
  onCropChange,
  onAltCropChange,
  onToggleAltCrop,
}: SceneTypeCardProps) {
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
        {/* Primary crop */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">Primary Crop</p>
            <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
              {sceneType.crop.width}&times;{sceneType.crop.height} at ({sceneType.crop.x}, {sceneType.crop.y})
            </span>
          </div>
          <CropCanvas
            frameUrl={sceneType.frameUrl}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            crop={sceneType.crop}
            onCropChange={onCropChange}
          />
        </div>

        {/* Alt crop */}
        {sceneType.hasAltCrop && sceneType.altCrop && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Alternating Crop</p>
              <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
                {sceneType.altCrop.width}&times;{sceneType.altCrop.height} at ({sceneType.altCrop.x}, {sceneType.altCrop.y})
              </span>
            </div>
            <CropCanvas
              frameUrl={sceneType.frameUrl}
              sourceWidth={sourceWidth}
              sourceHeight={sourceHeight}
              crop={sceneType.altCrop}
              onCropChange={onAltCropChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
