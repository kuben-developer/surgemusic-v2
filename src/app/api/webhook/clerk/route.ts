import { clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/server/db";

const webhookSecret: string = process.env.CLERK_WEBHOOK_SECRET || "";

async function verifyPayload(payload: any) {
    const payloadString = JSON.stringify(payload);
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixIdTimeStamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");
    if (!svixId || !svixIdTimeStamp || !svixSignature) {
        throw new Error("Error occured in svixSignature");
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
        throw new Error("Error occured");
    }
    return evt;
}

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const evt = await verifyPayload(payload);

        // Handle the webhook
        const eventType: EventType = evt.type;
        if (eventType === "user.created") {
            const { id } = evt.data;
            await (await clerkClient()).users.updateUserMetadata(id, {
                publicMetadata: {
                    user_created: true,
                },
            });

            await db.user.create({
                data: {
                    id,
                },
            });
        }
        return new Response("", {
            status: 201,
        });
    } catch (_) {
        throw new Response("Error occured", {
            status: 400,
        });
    }
}

type Event = {
    data: { id: string };
    type: EventType;
};

type EventType = "user.created" | "user.updated" | "*";
