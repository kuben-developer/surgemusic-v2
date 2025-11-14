import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Generate an upload URL for the client to upload a file directly to Convex storage
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Generate and return an upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Get the public URL for a stored file
export const getFileUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the public URL for the file
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("File not found");
    }

    return url;
  },
});

// Save file metadata to the files table (for tracking purposes only)
export const saveFileRecord = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    fileType: v.union(
      v.literal("audio"),
      v.literal("image"),
      v.literal("video")
    ),
    publicUrl: v.string(),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Save file metadata to the tracking table
    const fileId = await ctx.db.insert("files", {
      userId: user._id,
      storageId: args.storageId,
      filename: args.filename,
      contentType: args.contentType,
      size: args.size,
      uploadedAt: Date.now(),
      fileType: args.fileType,
      publicUrl: args.publicUrl,
      campaignId: args.campaignId,
    });

    return fileId;
  },
});

// Delete a file from storage (optional - for cleanup)
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Delete the file from storage
    await ctx.storage.delete(args.storageId);

    // Also delete the file record from the tracking table
    const fileRecord = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .unique();

    if (fileRecord) {
      await ctx.db.delete(fileRecord._id);
    }
  },
});

// Query to get all files for a user (optional - for file management)
export const getUserFiles = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("files")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
  },
});