export { default as ClipperPage } from "./ClipperPage";

// Export old clipper sub-feature (S3-based - to be deprecated)
export * from "./clipper";

// Export montager sub-feature
export * from "./montager";

// Export new list sub-feature (Convex DB-based)
export {
  FolderListPage,
  FolderDetailPage,
  CreateFolderDialog,
  FolderGrid,
  UploadVideoDialog,
  VideoGrid,
  VideoCard,
  useFolders,
  useFolderVideos,
  useVideoUpload as useVideoUploadDb,
} from "./list";

export type {
  ClipperFolder as ClipperFolderDb,
  ClippedVideo,
  OutputUrl,
  FolderId,
  VideoId,
} from "./list";

// Export shared types
export * from "./shared/types/common.types";
