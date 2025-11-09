import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

interface VideoData {
  campaignId: string;
  referenceId: string;
  videoId: string;
  videoUrl: string;
  postedAt: number;
}

interface VideoDataWithReport extends VideoData {
  reportName: string;
}

interface PaginatedResult {
  data: VideoData[];
  hasMore: boolean;
  nextCursor?: string;
}

export const exportAyrshareVideosEndpoint = httpAction(async (ctx, request) => {
  try {
    // Define the report names to filter by
    const reportNames = [
      "Tago - Right Here",
      "Renao",
      "Strandz",
      "Saint Levant",
      "Down For You - Mobb Deep x Nas x Jorja Smith",
    ];

    console.log(`Fetching reports: ${reportNames.join(", ")}`);

    // Get campaign IDs from reports
    const reportsData = await ctx.runQuery(
      internal.app.exportAyrshareVideos.getReportsByCampaigns,
      { reportNames }
    );

    const { campaignToReport, campaignIds } = reportsData;

    console.log(`Found ${campaignIds.length} campaigns across ${reportNames.length} reports`);

    if (campaignIds.length === 0) {
      console.log("No campaigns found in the specified reports");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const allVideos: VideoDataWithReport[] = [];
    let hasMore = true;
    let cursor: string | undefined = undefined;
    let batchCount = 0;

    // Fetch all data in batches using pagination
    while (hasMore) {
      batchCount++;
      console.log(`Fetching batch ${batchCount}...`);

      const result: PaginatedResult = await ctx.runQuery(
        internal.app.exportAyrshareVideos.getAllAyrshareVideosWithCampaigns,
        { batchSize: 100, cursor, campaignIds: campaignIds as any }
      );

      // Add report name to each video
      const videosWithReports = result.data.map(video => ({
        ...video,
        reportName: campaignToReport[video.campaignId] || 'Unknown',
      }));

      allVideos.push(...videosWithReports);
      hasMore = result.hasMore;
      cursor = result.nextCursor;

      console.log(`Batch ${batchCount}: fetched ${result.data.length} videos. Total: ${allVideos.length}`);
    }

    console.log(`Export complete: ${allVideos.length} total videos in ${batchCount} batches`);

    // Return the data as JSON
    return new Response(JSON.stringify(allVideos, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in exportAyrshareVideosEndpoint:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to export ayrshare videos data",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
