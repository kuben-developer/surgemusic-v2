import * as fs from 'fs';

// Use the custom API domain instead of direct Convex URL
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.surgemusic.io';
const EXPORT_ENDPOINT = `${API_BASE_URL}/export/ayrshare-videos`;

interface VideoData {
  reportName: string;
  campaignId: string;
  referenceId: string;
  videoId: string;
  videoUrl: string;
}

interface CSVRow {
  reportName: string;
  campaignId: string;
  referenceId: string;
  videoId: string;
  username: string;
}

/**
 * Extract username from TikTok video URL
 * Example: "https://www.tiktok.com/@isthatlegalbro/video/7568854295798402317" -> "isthatlegalbro"
 */
function extractUsername(videoUrl: string): string {
  try {
    // Pattern for TikTok URLs: https://www.tiktok.com/@{username}/video/{videoId}
    const tiktokMatch = videoUrl.match(/tiktok\.com\/@([^/]+)/);
    if (tiktokMatch) return tiktokMatch[1];

    // Pattern for Instagram URLs: https://www.instagram.com/reel/{reelId}/ or https://www.instagram.com/p/{postId}/
    // Instagram doesn't include username in the URL, so we return 'instagram' as placeholder
    if (videoUrl.includes('instagram.com')) return 'instagram';

    // Pattern for YouTube URLs: https://www.youtube.com/shorts/{videoId} or https://youtu.be/{videoId}
    // YouTube doesn't include username in short URLs, so we return 'youtube' as placeholder
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) return 'youtube';

    // If no pattern matches, return empty string
    return '';
  } catch (error) {
    console.error(`Error extracting username from URL: ${videoUrl}`, error);
    return '';
  }
}

/**
 * Convert data array to CSV format
 */
function convertToCSV(rows: CSVRow[]): string {
  // CSV headers
  const headers = ['Report Name', 'Campaign ID', 'Reference ID', 'Video ID', 'Username'];
  const csvLines = [headers.join(',')];

  // CSV rows
  for (const row of rows) {
    const values = [
      row.reportName,
      row.campaignId,
      row.referenceId,
      row.videoId,
      row.username,
    ];

    // Escape values that contain commas or quotes
    const escapedValues = values.map(value => {
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });

    csvLines.push(escapedValues.join(','));
  }

  return csvLines.join('\n');
}

async function main() {
  console.log('Starting Ayrshare videos export (HTTP method)...');
  console.log(`Fetching data from: ${EXPORT_ENDPOINT}`);

  try {
    // Fetch data from Convex HTTP endpoint
    console.log('Fetching ayrshare posted videos data...');
    const response = await fetch(EXPORT_ENDPOINT);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const videosData: VideoData[] = await response.json();

    if (!videosData || videosData.length === 0) {
      console.log('No ayrshare posted videos found.');
      return;
    }

    console.log(`Found ${videosData.length} videos. Processing...`);

    // Transform data and extract usernames
    const csvRows: CSVRow[] = videosData.map((video: VideoData) => ({
      reportName: video.reportName,
      campaignId: video.campaignId,
      referenceId: video.referenceId,
      videoId: video.videoId,
      username: extractUsername(video.videoUrl),
    }));

    // Convert to CSV
    const csvContent = convertToCSV(csvRows);

    // Write to file
    const outputPath = 'scripts/ayrshare-videos-export.csv';
    fs.writeFileSync(outputPath, csvContent, 'utf-8');

    console.log(`✅ CSV export complete!`);
    console.log(`📄 File saved to: ${outputPath}`);
    console.log(`📊 Total records: ${csvRows.length}`);

    // Show some stats
    const usernameStats = csvRows.reduce((acc, row) => {
      if (row.username) {
        acc.withUsername++;
      } else {
        acc.withoutUsername++;
      }
      return acc;
    }, { withUsername: 0, withoutUsername: 0 });

    console.log(`\nStatistics:`);
    console.log(`  - Videos with username: ${usernameStats.withUsername}`);
    console.log(`  - Videos without username: ${usernameStats.withoutUsername}`);

  } catch (error) {
    console.error('Error during export:', error);
    throw error;
  }
}

main().catch(console.error);
