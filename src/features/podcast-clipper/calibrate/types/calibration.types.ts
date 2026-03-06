import type { CropRegion } from "../../shared/types/podcast-clipper.types";
import type { Id } from "../../../../../convex/_generated/dataModel";

export interface SceneTypeCropState {
  sceneTypeDbId: Id<"podcastClipperSceneTypes">;
  sceneTypeId: number;
  frameUrl: string;
  crop: CropRegion;
  altCrop: CropRegion | null;
  hasAltCrop: boolean;
}
