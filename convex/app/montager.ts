"use node"

import { action } from "../_generated/server";
import { v } from "convex/values";
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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
export interface MontagerFolder {
  name: string;
  montageCount: number;
  lastModified: number;
}

export interface Montage {
  key: string;
  filename: string;
  size: number;
  lastModified: number;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

/**
 * List all folders under montages/
 */
export const listMontagerFolders = action({
  args: {},
  handler: async (): Promise<MontagerFolder[]> => {
    try {
      // List all folders under montages/
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: "montages/",
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
        const outputsResponse = await s3Client.send(new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: `montages/${folderName}/outputs/`,
        }));

        // Count files (exclude folder placeholders and thumbnails)
        const montageCount = Math.max(0, (outputsResponse.Contents?.filter(obj =>
          obj.Key && !obj.Key.includes('/thumbnails/') && obj.Key.endsWith('.mp4')
        ).length || 0));

        // Get last modified time (use the most recent file)
        const allContents = outputsResponse.Contents || [];
        const lastModified = allContents.reduce((latest, item) => {
          return item.LastModified && item.LastModified.getTime() > latest
            ? item.LastModified.getTime()
            : latest;
        }, 0);

        return {
          name: folderName,
          montageCount,
          lastModified,
        };
      });

      // Wait for all folder stats to be fetched in parallel
      const folders = await Promise.all(folderStatsPromises);

      return folders;
    } catch (error) {
      console.error("Error listing montager folders:", error);
      throw new Error(`Failed to list montager folders: ${error}`);
    }
  },
});

/**
 * Create a new folder in montages/
 */
export const createMontagerFolder = action({
  args: {
    folderName: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; message: string }> => {
    // Validate folder name (no special characters)
    if (!/^[a-zA-Z0-9_-]+$/.test(args.folderName)) {
      return {
        success: false,
        message: "Folder name can only contain letters, numbers, hyphens, and underscores",
      };
    }

    // Check if folder already exists
    try {
      const checkCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `montages/${args.folderName}/`,
        MaxKeys: 1,
      });

      const existingFolder = await s3Client.send(checkCommand);

      if (existingFolder.Contents && existingFolder.Contents.length > 0) {
        return {
          success: false,
          message: "Folder name already exists",
        };
      }
    } catch (error) {
      console.error("Error checking folder existence:", error);
      return {
        success: false,
        message: "Failed to check folder existence",
      };
    }

    // Create inputs and outputs folders by uploading empty objects
    try {
      const inputsKey = `montages/${args.folderName}/inputs/.keep`;
      const outputsKey = `montages/${args.folderName}/outputs/.keep`;

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
      return {
        success: false,
        message: "Failed to create folder",
      };
    }
  },
});

/**
 * Delete a montager folder and all its contents
 */
export const deleteMontagerFolder = action({
  args: {
    folderName: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; message: string; deletedCount: number }> => {
    try {
      // List all objects in the folder
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `montages/${args.folderName}/`,
      });

      const response = await s3Client.send(command);

      if (!response.Contents || response.Contents.length === 0) {
        return {
          success: true,
          message: `Folder "${args.folderName}" not found or already empty`,
          deletedCount: 0,
        };
      }

      // Delete all objects in the folder
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: response.Contents.map(obj => ({ Key: obj.Key! })),
          Quiet: false,
        },
      });

      const deleteResponse = await s3Client.send(deleteCommand);
      const deletedCount = deleteResponse.Deleted?.length || 0;
      const errors = deleteResponse.Errors || [];

      if (errors.length > 0) {
        console.error("Some files failed to delete:", errors);
        return {
          success: false,
          message: `Deleted ${deletedCount} files, but ${errors.length} failed`,
          deletedCount,
        };
      }

      return {
        success: true,
        message: `Successfully deleted folder "${args.folderName}" and ${deletedCount} files`,
        deletedCount,
      };
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw new Error(`Failed to delete folder: ${error}`);
    }
  },
});

/**
 * Upload montage configuration JSON to S3
 */
export const uploadMontageConfig = action({
  args: {
    folderName: v.string(),
    configName: v.string(),
    montages: v.array(v.object({
      montage_name: v.string(),
      clips: v.array(v.string()),
    })),
    createdAt: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; message: string; key: string }> => {
    try {
      // Create JSON config
      const config = {
        montages: args.montages,
        created_at: args.createdAt,
      };

      const key = `montages/${args.folderName}/inputs/${args.configName}.json`;

      // Upload JSON to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(config, null, 2),
        ContentType: 'application/json',
      }));

      return {
        success: true,
        message: `Configuration uploaded successfully`,
        key,
      };
    } catch (error) {
      console.error("Error uploading montage config:", error);
      throw new Error(`Failed to upload montage config: ${error}`);
    }
  },
});

/**
 * List all montages from a folder's outputs directory with thumbnails
 */
export const listMontages = action({
  args: {
    folderName: v.string(),
  },
  handler: async (_ctx, args): Promise<Montage[]> => {
    try {
      // Fetch both outputs and thumbnails in parallel
      const [outputsResponse, thumbnailsResponse] = await Promise.all([
        s3Client.send(new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: `montages/${args.folderName}/outputs/`,
        })),
        s3Client.send(new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: `montages/${args.folderName}/outputs/thumbnails/`,
        })),
      ]);

      if (!outputsResponse.Contents) {
        return [];
      }

      // Create a map of thumbnails by filename (without extension)
      const thumbnailMap = new Map<string, string>();
      if (thumbnailsResponse.Contents) {
        thumbnailsResponse.Contents.forEach((obj) => {
          if (obj.Key && !obj.Key.endsWith('/') && obj.Key.toLowerCase().endsWith('.jpg')) {
            const filename = obj.Key.split('/').pop()!;
            // Remove .jpg extension to get base filename
            const baseFilename = filename.replace(/\.jpg$/i, '');
            thumbnailMap.set(baseFilename, obj.Key);
          }
        });
      }

      // Filter out folders, non-video files, thumbnails subfolder, and map to Montage objects
      const montages: Montage[] = outputsResponse.Contents
        .filter((obj): obj is NonNullable<typeof obj> & { Key: string; Size: number; LastModified: Date } => {
          if (!obj.Key || obj.Key.endsWith('/')) return false;

          // Exclude files in the thumbnails subfolder
          if (obj.Key.includes('/thumbnails/')) return false;

          // Only include .mp4 files
          return obj.Key.toLowerCase().endsWith('.mp4');
        })
        .map((obj): Montage => {
          const filename = obj.Key.split('/').pop()!;

          // Get base filename without extension for thumbnail lookup
          const baseFilename = filename.replace(/\.mp4$/i, '');
          const thumbnailKey = thumbnailMap.get(baseFilename);

          return {
            key: obj.Key,
            filename,
            size: obj.Size || 0,
            lastModified: obj.LastModified?.getTime() || 0,
            thumbnailKey,
          };
        });

      return montages;
    } catch (error) {
      console.error("Error listing montages:", error);
      throw new Error(`Failed to list montages: ${error}`);
    }
  },
});

/**
 * Generate presigned URL for viewing a montage
 */
export const getMontageUrl = action({
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
      console.error("Error generating montage URL:", error);
      throw new Error(`Failed to generate montage URL: ${error}`);
    }
  },
});

/**
 * Get presigned URLs for multiple montage thumbnails (batch operation)
 */
export const getMontagesThumbnailUrls = action({
  args: {
    keys: v.array(v.string()),
  },
  handler: async (_ctx, args): Promise<Array<{ key: string; thumbnailUrl: string }>> => {
    if (args.keys.length === 0) {
      return [];
    }

    try {
      // Generate presigned URLs for all thumbnails in parallel
      const urlPromises = args.keys.map(async (key) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });

        const thumbnailUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

        return {
          key,
          thumbnailUrl,
        };
      });

      const results = await Promise.all(urlPromises);
      return results;
    } catch (error) {
      console.error("Error generating thumbnail URLs:", error);
      throw new Error(`Failed to generate thumbnail URLs: ${error}`);
    }
  },
});

/**
 * Check montage config status (pending, processing, completed)
 */
export const getMontageConfigStatus = action({
  args: {
    folderName: v.string(),
    configName: v.string(),
  },
  handler: async (_ctx, args): Promise<{ status: 'pending' | 'processing' | 'completed' | 'not_found' }> => {
    try {
      const pendingKey = `montages/${args.folderName}/inputs/${args.configName}.json`;
      const doneKey = `montages/${args.folderName}/inputs/${args.configName}_done.json`;

      // Check if pending JSON exists
      try {
        await s3Client.send(new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: pendingKey,
        }));
        return { status: 'processing' };
      } catch (err) {
        // File doesn't exist, check for _done version
      }

      // Check if _done JSON exists
      try {
        await s3Client.send(new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: doneKey,
        }));
        return { status: 'completed' };
      } catch (err) {
        // Neither file exists
      }

      return { status: 'not_found' };
    } catch (error) {
      console.error("Error checking montage config status:", error);
      throw new Error(`Failed to check montage config status: ${error}`);
    }
  },
});
