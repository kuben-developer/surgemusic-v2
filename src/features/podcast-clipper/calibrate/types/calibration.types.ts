import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import type { Id } from "../../../../../convex/_generated/dataModel";

export interface CropKeyframe {
  keyframeId: Id<"podcastClipperCropKeyframes">;
  sceneTypeId: Id<"podcastClipperSceneTypes">;
  timestamp: number;
  frameUrl: string;
  crop: CropRegion | null;
  altCrop: CropRegion | null;
}

export interface SceneTypeCropState {
  sceneTypeDbId: Id<"podcastClipperSceneTypes">;
  sceneTypeId: number;
  frameUrl: string;
  crop: CropRegion;
  altCrop: CropRegion | null;
  hasAltCrop: boolean;
  keyframes: CropKeyframe[];
  selectedKeyframeIndex: number | null; // null = editing the default (representative frame)
}
