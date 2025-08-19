import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { Webhook } from "svix";

export const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret: string = process.env.CLERK_WEBHOOK_SECRET || "";
  try {
    const payload = await request.json();
    const payloadString = JSON.stringify(payload);
    
    const svixId = request.headers.get("svix-id");
    const svixIdTimeStamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");
    
    if (!svixId || !svixIdTimeStamp || !svixSignature) {
      return new Response("Error occurred in svixSignature", {
        status: 400,
      });
    }
    
    const svixHeaders = {
      "svix-id": svixId,
      "svix-timestamp": svixIdTimeStamp,
      "svix-signature": svixSignature,
    };
    
    const wh = new Webhook(webhookSecret);
    let evt: Event | null = null;
    
    try {
      evt = wh.verify(payloadString, svixHeaders) as Event;
    } catch (_) {
      return new Response("Error occurred", {
        status: 400,
      });
    }
    
    // Handle the webhook
    const eventType: EventType = evt.type;
    if (eventType === "user.created") {
      const { id } = evt.data;
      
      // Create user in Convex database
      await ctx.runMutation(internal.webhooks.clerk.createUser, {
        clerkId: id,
      });
      
      // Update user metadata via Clerk API
      const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${id}/metadata`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: {
            user_created: true,
          },
        }),
      });
      
      if (!clerkResponse.ok) {
        console.error("Failed to update Clerk user metadata");
      }
    }
    
    return new Response("", {
      status: 201,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error occurred", {
      status: 400,
    });
  }
});

type Event = {
  data: { id: string };
  type: EventType;
};

type EventType = "user.created" | "user.updated" | "*";

// Internal mutation to create user
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (existingUser) {
      return existingUser._id;
    }
    
    // Create new user with default values
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      billing: {
        firstTimeUser: true,
        isTrial: false,
      },
      credits: {
        videoGeneration: 0,
        videoGenerationAdditional: 0,
        postScheduler: 0,
        postSchedulerAdditional: 0,
      },
    });
    
    return userId;
  },
});