import { db } from "@/server/db";

export async function POST(req: Request) {
    const body = await req.text();
    console.log("Make.com webhook received", body);

    try {
        const videos = JSON.parse(body) as Array<{
            URL: string;
            "CAMPAIGN ID": number;
            "CONTENT TYPE": string;
            "TOTAL_VIDEO": number;
            "TEMPLATE ID": string;
        }>;

        // Create a counter for each video type
        const videoTypeCounters = new Map<string, number>();

        // Process each video
        for (const video of videos) {
            // Standardize video type to normal case (e.g., "REACTIONS" -> "Reactions")
            const videoType = video["CONTENT TYPE"].toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

            // Increment counter for this video type
            const currentCount = videoTypeCounters.get(videoType) ?? 0;
            videoTypeCounters.set(videoType, currentCount + 1);

            // Generate video name
            const videoName = `${videoType} ${currentCount + 1}`;

            // Store in database
            await db.generatedVideo.create({
                data: {
                    campaignId: video["CAMPAIGN ID"].toString(),
                    videoName: videoName,
                    videoUrl: video.URL,
                    videoType: videoType,
                    templateId: video["TEMPLATE ID"]
                }
            });
        }
        if (videos.length > 0) {
            // Get total videos generated for this campaign
            const campaignId = videos[0]?.["CAMPAIGN ID"].toString();
            const totalVideosNeeded = videos[0]?.["TOTAL_VIDEO"];

            const generatedVideosCount = await db.generatedVideo.count({
                where: { campaignId }
            });

            // Mark as complete only if we've generated all videos
            if (totalVideosNeeded && generatedVideosCount >= totalVideosNeeded) {
                await db.campaign.update({
                    where: { id: campaignId },
                    data: { isCompleted: true }
                });
            }
        }

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response("Error processing webhook", { status: 500 });
    }
} 