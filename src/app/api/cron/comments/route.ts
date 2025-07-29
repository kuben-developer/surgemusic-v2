import { NextResponse } from 'next/server';
import { put } from "@vercel/blob";
import { db } from "@/server/db";
import { createClient } from '@clickhouse/client';

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY || "";

const clickhouseClient = createClient({
    host: 'http://38.107.226.158:8123',
    username: 'default',
    password: 'VK804XEsgkr5d0dMf42DhUZ',
    database: 'tiktok',
    request_timeout: 30000,
    max_open_connections: 10,
    compression: {
        request: true,
        response: true
    }
});

export async function GET() {
    console.log("GETTING /api/cron/comments");

    try {
        // Step 1: Query ClickHouse for all posts with comments > 0
        let rows: any[] = [];
        let retries = 3;

        while (retries > 0) {
            try {
                const result = await clickhouseClient.query({
                    query: `
                    SELECT 
                        post_id,
                        campaign_id,
                        comments,
                        views,
                        likes,
                        shares,
                        updated_at
                    FROM (
                        SELECT 
                            post_id,
                            campaign_id,
                            comments,
                            views,
                            likes,
                            shares,
                            updated_at,
                            row_number() OVER (PARTITION BY post_id ORDER BY updated_at DESC) as rn
                        FROM SurgeMusicPostedVideos FINAL
                    ) t
                    WHERE rn = 1 AND comments > 0
                    `,
                    format: 'JSONEachRow',
                });

                rows = await result.json();
                break;

            } catch (error) {
                retries--;
                if (retries === 0) {
                    console.error('ClickHouse query failed after retries:', error);
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`Found ${rows.length} posts with comments`);
        console.log(`Total comments ${rows.reduce((acc, row) => acc + Number(row.comments), 0)}`);

        // Helper function to process a single row
        async function processRow(row: any) {
            const postId = row.post_id;

            // Find the GeneratedVideo by postId
            const generatedVideo = await db.generatedVideo.findFirst({
                where: {
                    postId: postId
                },
                include: {
                    campaign: true,
                    scheduledSocialAccounts: {
                        include: {
                            ayrshareProfile: true
                        }
                    }
                }
            });

            if (!generatedVideo || generatedVideo.scheduledSocialAccounts.length === 0) {
                console.log(`No profile found for post ${postId}`);
                return null;
            }

            // Get the profile_key from the first scheduled social account
            const profileKey = generatedVideo.scheduledSocialAccounts[0]?.ayrshareProfile.profileKey;

            if (!profileKey) {
                console.log(`No profile key found for post ${postId}`);
                return null;
            }

            // Step 3: Fetch comments from Ayrshare API
            try {
                const commentsResponse = await fetch(
                    `https://api.ayrshare.com/api/comments/${postId}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
                            "Profile-Key": profileKey,
                            "Content-Type": "application/json"
                        }
                    }
                );

                if (!commentsResponse.ok) {
                    console.error(`Failed to fetch comments for post ${postId}: ${commentsResponse.status}`);
                    return null;
                }

                const comments = await commentsResponse.json();
                // console.log("comments", comments);

                // Combine all data
                return {
                    campaignId: generatedVideo.campaignId,
                    postCaption: generatedVideo.postCaption,
                    tiktokUrl: generatedVideo.tiktokUrl,
                    comments: comments.tiktok.map((comment: any) => ({
                        text: comment.comment,
                        createdAt: comment.created,
                        likeCount: comment.likeCount,
                        username: comment.username,
                    })),
                    fetchedAt: new Date().toISOString()
                };

            } catch (error) {
                console.error(`Error fetching comments for post ${postId}:`, error);
                return null;
            }
        }

        // Process rows in parallel with concurrency limit of 20
        const CONCURRENCY_LIMIT = 25;
        const commentsData = [];

        // Process in batches of 20
        for (let i = 0; i < rows.length; i += CONCURRENCY_LIMIT) {
            const batch = rows.slice(i, i + CONCURRENCY_LIMIT);
            const batchResults = await Promise.all(
                batch.map(row => processRow(row))
            );

            // Filter out null results and add to commentsData
            const validResults = batchResults.filter(result => result !== null);
            commentsData.push(...validResults);
        }

        // Step 4: Store the combined data as JSON blob
        const timestamp = new Date().toISOString();
        const blobData = {
            timestamp: timestamp,
            totalPosts: commentsData.reduce((acc, com) => acc + Number(com.comments.length), 0),
            data: commentsData
        };

        await put('comments-data.json', JSON.stringify(blobData), {
            access: 'public',
            allowOverwrite: true
        });

        console.log(`Successfully stored comments data for ${commentsData.length} posts`);

        return NextResponse.json({
            ok: true,
            postsProcessed: commentsData.length,
            timestamp: timestamp
        });

    } catch (error) {
        console.error('Error in comments cron job:', error);
        return NextResponse.json({
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}