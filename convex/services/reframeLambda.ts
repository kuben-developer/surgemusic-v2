"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
const CLIP_REFRAME_FUNCTION_NAME = process.env.CLIP_REFRAME_FUNCTION_NAME ?? "podcast-clipper-ClipReframeFunction";

/**
 * Convex action that invokes the clip reframe Lambda directly (one per clip).
 *
 * Called via ctx.scheduler.runAfter(0, ...) when a clip status becomes "cut".
 * Downloads the short clip, detects scenes, reframes, and uploads result.
 */
export const invokeClipReframe = internalAction({
  args: {
    clipId: v.id("podcastClipperClips"),
  },
  handler: async (ctx, args) => {
    // Fetch clip data
    const clipData = await ctx.runQuery(
      internal.app.podcastClipperClipsDb.getClipReframeData,
      { clipId: args.clipId }
    );

    if (!clipData) {
      console.error(`No clip data found for ${args.clipId}`);
      return;
    }

    // Mark clip as reframing
    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.updateClipStatus,
      { clipId: args.clipId, status: "reframing" }
    );

    const lambdaClient = new LambdaClient({ region: AWS_REGION });

    const payload = {
      clipId: clipData.clipId,
      videoUrl: clipData.cutVideoUrl,
      config: clipData.config,
      sceneTypes: clipData.sceneTypes,
    };

    try {
      const command = new InvokeCommand({
        FunctionName: CLIP_REFRAME_FUNCTION_NAME,
        InvocationType: "Event", // async — Lambda posts result back via webhook
        Payload: new TextEncoder().encode(JSON.stringify(payload)),
      });

      const response = await lambdaClient.send(command);
      console.log(
        `Invoked clip reframe Lambda for clip ${args.clipId}, status=${response.StatusCode}`
      );
    } catch (error) {
      console.error(`Failed to invoke clip reframe Lambda for ${args.clipId}:`, error);

      await ctx.runMutation(
        internal.app.podcastClipperClipsDb.failClip,
        {
          clipId: args.clipId,
          errorMessage: `Failed to invoke reframe Lambda: ${error instanceof Error ? error.message : String(error)}`,
        }
      );
    }
  },
});
