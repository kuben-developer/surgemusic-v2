"use node";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { action } from "../_generated/server";

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
  forcePathStyle: true,
});

/**
 * Generate presigned upload URL for direct video upload to Ready to Publish
 * Videos are stored in the direct-uploads/ prefix for organization
 */
export const generateDirectUploadUrl = action({
  args: {
    filename: v.string(),
    contentType: v.string(),
  },
  handler: async (_ctx, args): Promise<{ uploadUrl: string; videoUrl: string }> => {
    const validExtensions = [".mp4", ".mov", ".mkv", ".avi", ".webm"];
    const hasValidExtension = validExtensions.some((ext) =>
      args.filename.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      throw new Error(
        `Invalid file type. Supported formats: ${validExtensions.join(", ")}`
      );
    }

    try {
      const uniqueKey = `direct-uploads/${Date.now()}_${args.filename}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueKey,
        ContentType: args.contentType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      const videoUrl = `https://${BUCKET_NAME}.s3.us-west-004.backblazeb2.com/${uniqueKey}`;

      return {
        uploadUrl,
        videoUrl,
      };
    } catch (error) {
      console.error("Error generating direct upload URL:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to generate upload URL: ${message}`);
    }
  },
});
