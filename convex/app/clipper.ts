"use node"

import { action } from "../_generated/server";
import { v } from "convex/values";
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = "surge-clipper";
const accessKeyId = process.env.CLIPPER_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.CLIPPER_SECRET_ACCESS_KEY ?? "";

const s3Client = new S3Client({
  region: "us-west-004",
  endpoint: "https://s3.us-west-004.backblazeb2.com",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Required for Backblaze B2 compatibility
});

// Type definitions
export interface ClipperFolder {
  name: string;
  videoCount: number;
  clipCount: number;
  lastModified: number;
}

export interface ClipperClip {
  key: string;
  filename: string;
  size: number;
  lastModified: number;
  clarity: number;
  brightness: number;
  presignedUrl?: string;
}

// Helper function to parse quality metrics from filename
function parseMetricsFromFilename(filename: string): { clarity: number; brightness: number } {
  const match = filename.match(/clear(\d+)_bright(\d+)/);
  if (match && match[1] && match[2]) {
    return {
      clarity: parseInt(match[1], 10),
      brightness: parseInt(match[2], 10),
    };
  }
  return { clarity: 0, brightness: 0 };
}

/**
 * List all folders under clips/
 * Optimized to batch all S3 list operations in parallel instead of sequentially
 */
export const listFolders = action({
  args: {},
  handler: async (): Promise<ClipperFolder[]> => {

    try {
      // List all folders under clips/
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "clips/",
        Delimiter: "/",
      });

      const response = await s3Client.send(command);

      if (!response.CommonPrefixes) {
        return [];
      }

      // Extract folder names
      const folderNames = response.CommonPrefixes
        .map((prefix) => prefix.Prefix?.split('/').filter(Boolean)[1])
        .filter((name): name is string => name !== undefined);

      if (folderNames.length === 0) {
        return [];
      }

      // Batch all S3 list operations in parallel for better performance
      const folderStatsPromises = folderNames.map(async (folderName) => {
        const [inputsResponse, outputsResponse] = await Promise.all([
          s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: `clips/${folderName}/inputs/`,
          })),
          s3Client.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: `clips/${folderName}/outputs/`,
          })),
        ]);

        // Count files (exclude folder placeholders)
        const videoCount = Math.max(0, (inputsResponse.Contents?.length || 0) - 1);
        const clipCount = Math.max(0, (outputsResponse.Contents?.length || 0) - 1);

        // Get last modified time (use the most recent file)
        const allContents = [
          ...(inputsResponse.Contents || []),
          ...(outputsResponse.Contents || []),
        ];
        const lastModified = allContents.reduce((latest, item) => {
          return item.LastModified && item.LastModified.getTime() > latest
            ? item.LastModified.getTime()
            : latest;
        }, 0);

        return {
          name: folderName,
          videoCount,
          clipCount,
          lastModified,
        };
      });

      // Wait for all folder stats to be fetched in parallel
      const folders = await Promise.all(folderStatsPromises);

      return folders;
    } catch (error) {
      console.error("Error listing folders:", error);
      throw new Error(`Failed to list folders: ${error}`);
    }
  },
});

/**
 * Create a new folder in clips/
 */
export const createFolder = action({
  args: {
    folderName: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; message: string }> => {

    // Validate folder name (no special characters)
    if (!/^[a-zA-Z0-9_-]+$/.test(args.folderName)) {
      throw new Error("Folder name can only contain letters, numbers, hyphens, and underscores");
    }

    try {
      // Create inputs and outputs folders by uploading empty objects
      const inputsKey = `clips/${args.folderName}/inputs/.keep`;
      const outputsKey = `clips/${args.folderName}/outputs/.keep`;

      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: inputsKey,
        Body: new Uint8Array(0),
      }));

      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: outputsKey,
        Body: new Uint8Array(0),
      }));

      return {
        success: true,
        message: `Folder "${args.folderName}" created successfully`,
      };
    } catch (error) {
      console.error("Error creating folder:", error);
      throw new Error(`Failed to create folder: ${error}`);
    }
  },
});

/**
 * Generate presigned upload URL for video upload to S3
 */
export const generateUploadUrl = action({
  args: {
    folderName: v.string(),
    filename: v.string(),
    contentType: v.string(),
  },
  handler: async (_ctx, args): Promise<{ uploadUrl: string; key: string }> => {

    // Validate file type
    const validExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
    const hasValidExtension = validExtensions.some(ext => args.filename.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      throw new Error(`Invalid file type. Supported formats: ${validExtensions.join(', ')}`);
    }

    try {
      const key = `clips/${args.folderName}/inputs/${args.filename}`;

      // Generate presigned URL for PUT operation
      // ContentType must be included in the signature for Backblaze B2
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: args.contentType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

      return {
        uploadUrl,
        key,
      };
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw new Error(`Failed to generate upload URL: ${error}`);
    }
  },
});

/**
 * List all clips from a folder's outputs directory
 */
export const listClips = action({
  args: {
    folderName: v.string(),
  },
  handler: async (_ctx, args): Promise<ClipperClip[]> => {
    const s3Client = getS3Client();

    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `clips/${args.folderName}/outputs/`,
      });

      const response = await s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      // Video file extensions to include
      const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];

      // Filter out folders, non-video files, and map to ClipperClip objects
      const clips: ClipperClip[] = response.Contents
        .filter((obj): obj is NonNullable<typeof obj> & { Key: string } => {
          if (!obj.Key || obj.Key.endsWith('/')) return false;

          const filename = obj.Key.toLowerCase();
          // Check if file has a video extension
          return VIDEO_EXTENSIONS.some(ext => filename.endsWith(ext));
        })
        .map((obj): ClipperClip => {
          const filename = obj.Key.split('/').pop()!;
          const metrics = parseMetricsFromFilename(filename);

          return {
            key: obj.Key,
            filename,
            size: obj.Size || 0,
            lastModified: obj.LastModified?.getTime() || 0,
            clarity: metrics.clarity,
            brightness: metrics.brightness,
          };
        });

      return clips;
    } catch (error) {
      console.error("Error listing clips:", error);
      throw new Error(`Failed to list clips: ${error}`);
    }
  },
});

/**
 * Generate presigned URL for viewing a clip
 */
export const getClipUrl = action({
  args: {
    key: v.string(),
  },
  handler: async (_ctx, args): Promise<string> => {

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: args.key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
      return url;
    } catch (error) {
      console.error("Error generating clip URL:", error);
      throw new Error(`Failed to generate clip URL: ${error}`);
    }
  },
});

/**
 * Delete multiple clips from S3
 */
export const deleteClips = action({
  args: {
    keys: v.array(v.string()),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; message: string; deletedCount: number }> => {

    if (args.keys.length === 0) {
      return {
        success: true,
        message: "No clips to delete",
        deletedCount: 0,
      };
    }

    try {
      const command = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: args.keys.map(key => ({ Key: key })),
          Quiet: false,
        },
      });

      const response = await s3Client.send(command);
      const deletedCount = response.Deleted?.length || 0;
      const errors = response.Errors || [];

      if (errors.length > 0) {
        console.error("Some clips failed to delete:", errors);
        return {
          success: false,
          message: `Deleted ${deletedCount} clips, but ${errors.length} failed`,
          deletedCount,
        };
      }

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} clips`,
        deletedCount,
      };
    } catch (error) {
      console.error("Error deleting clips:", error);
      throw new Error(`Failed to delete clips: ${error}`);
    }
  },
});

/**
 * Check if a file exists in S3
 */
export const checkFileExists = action({
  args: {
    key: v.string(),
  },
  handler: async (_ctx, args): Promise<boolean> => {

    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: args.key,
      }));
      return true;
    } catch (error) {
      return false;
    }
  },
});
