import { NextResponse } from 'next/server';
import { put } from "@vercel/blob";
import { db } from "@/server/db";

export async function GET() {
    console.log("GETTING /api/cron/reports");

    const days = 30;
    const userId = 'user_2wMlUGA4HD8175cddTdsJa7q5nL';
    
    try {
        // Fetch reports for specific user from the database
        const reports = await db.report.findMany({
            where: {
                userId: userId
            },
            include: {
                campaigns: {
                    select: { id: true }
                },
                reportHiddenVideo: {
                    select: { videoId: true }
                }
            }
        });

        console.log(`Found ${reports.length} reports to process`);

        // Import the necessary function
        const { fetchCombinedAnalytics } = await import("@/server/api/routers/campaign");

        // Process each report
        for (const report of reports) {
            console.log(`Processing report ${report.id} - ${report.name}`);

            // Extract campaign IDs from the report
            const campaignIds = report.campaigns.map(campaign => campaign.id);
            
            // Extract hidden video IDs
            const hiddenVideoIds = report.reportHiddenVideo.map(item => item.videoId);

            if (campaignIds.length === 0) {
                console.log(`Skipping report ${report.id} - no campaigns`);
                continue;
            }

            // Fetch analytics data filtered by the report's campaign IDs
            // Pass the userId from the report owner since we're accessing it anonymously
            const analyticsData = await fetchCombinedAnalytics(
                campaignIds,
                days,
                report.userId,
                db,
                hiddenVideoIds
            );

            // Store the analytics data in blob storage
            const blobName = `report-analytics/${report.id}.json`;
            await put(blobName, JSON.stringify({
                ...analyticsData,
                reportId: report.id,
                processedAt: new Date().toISOString()
            }), { 
                access: 'public', 
                allowOverwrite: true,
            });

            console.log(`Analytics data stored for report ${report.id}`);
        }

        return NextResponse.json({ 
            ok: true, 
            processedReports: reports.length 
        });
    } catch (error) {
        console.error("Error processing report analytics:", error);
        return NextResponse.json({ 
            ok: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}