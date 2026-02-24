"use node"

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

export const generatePodcastUploadUrl = action({
  args: {
    filename: v.string(),
    contentType: v.string(),
  },
  handler: async (_ctx, args): Promise<{ uploadUrl: string; fileUrl: string }> => {
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
      const uniqueKey = `podcast-clipper/inputs/${Date.now()}_${args.filename}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueKey,
        ContentType: args.contentType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      const fileUrl = `https://${BUCKET_NAME}.s3.us-west-004.backblazeb2.com/${uniqueKey}`;

      return { uploadUrl, fileUrl };
    } catch (error) {
      console.error("Error generating podcast upload URL:", error);
      throw new Error(`Failed to generate upload URL: ${error}`);
    }
  },
});
