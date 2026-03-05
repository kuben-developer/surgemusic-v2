"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const SFN_STATE_MACHINE_ARN = process.env.REFRAME_STATE_MACHINE_ARN ?? "";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";

/**
 * Convex action that invokes the AWS Step Functions reframe pipeline.
 *
 * Called via ctx.scheduler.runAfter(0, ...) from the startReframe mutation.
 * Gathers task data and starts a Step Functions execution for each reframe task.
 */
export const invokeReframePipeline = internalAction({
  args: {
    taskId: v.id("podcastClipperTasks"),
  },
  handler: async (ctx, args) => {
    // Fetch full task data
    const taskData = await ctx.runQuery(
      internal.app.podcastClipperDb.getReframeTaskData,
      { taskId: args.taskId }
    );

    if (!taskData) {
      console.error(`No task data found for ${args.taskId}`);
      return;
    }

    // Mark task as processing
    await ctx.runMutation(
      internal.app.podcastClipperDb.markTaskProcessing,
      { taskId: args.taskId }
    );

    // Start Step Functions execution
    const sfnClient = new SFNClient({ region: AWS_REGION });

    const input = {
      taskId: taskData.taskId,
      videoId: taskData.videoId,
      targetVideoUrl: taskData.targetVideoUrl,
      config: taskData.config,
      sceneTypes: taskData.sceneTypes,
    };

    try {
      const command = new StartExecutionCommand({
        stateMachineArn: SFN_STATE_MACHINE_ARN,
        name: `reframe-${taskData.taskId}-${Date.now()}`,
        input: JSON.stringify(input),
      });

      const response = await sfnClient.send(command);
      console.log(
        `Started Step Functions execution: ${response.executionArn} for task ${args.taskId}`
      );
    } catch (error) {
      console.error(`Failed to start Step Functions for task ${args.taskId}:`, error);

      // Report failure back to Convex
      await ctx.runMutation(
        internal.app.podcastClipperDb.failTask,
        {
          taskId: args.taskId,
          errorMessage: `Failed to start Lambda pipeline: ${error instanceof Error ? error.message : String(error)}`,
        }
      );
    }
  },
});
