import * as fs from 'fs';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appxjuaDSRBQ5Sv5T';
const AIRTABLE_CONTENT_TABLE_ID = 'tbleqHUKb7il998rO';
const AIRTABLE_POSTING_TABLE_ID = 'tbl9Ev3UoSk1Jb7rG'; // TIKTOK POSTING table
const BATCH_SIZE = 10; // Update 10 records at a time

if (!AIRTABLE_API_KEY) {
  console.error('Error: AIRTABLE_API_KEY environment variable is required');
  process.exit(1);
}

// Interfaces
interface TikTokPost {
  video_id: string;
  desc: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  postedAt: number;
  campaign_name: string;
  username: string;
  csv_video_id?: string;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

/**
 * Find Airtable record by video_id field
 */
async function findRecordByVideoId(videoId: string): Promise<AirtableRecord | null> {
  try {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTENT_TABLE_ID}`);

    // Filter by video_id field matching the csv_video_id
    url.searchParams.append('filterByFormula', `{video_id} = '${videoId}'`);
    url.searchParams.append('maxRecords', '1');

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      console.error(`  API error: ${response.status}`);
      return null;
    }

    const data: AirtableResponse = await response.json();
    return data.records.length > 0 ? (data.records[0] ?? null) : null;
  } catch (error) {
    console.error(`  Error finding record for video_id ${videoId}:`, error);
    return null;
  }
}

/**
 * Find existing record in TIKTOK POSTING table by video_id
 */
async function findPostingRecord(videoId: string): Promise<string | null> {
  try {
    // Search for existing record in TIKTOK POSTING table
    const searchUrl = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_POSTING_TABLE_ID}`);
    searchUrl.searchParams.append('filterByFormula', `{video_id} = '${videoId}'`);
    searchUrl.searchParams.append('maxRecords', '1');

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (searchResponse.ok) {
      const data: AirtableResponse = await searchResponse.json();
      if (data.records.length > 0) {
        console.log(`  ✓ Found existing TIKTOK POSTING record: ${data.records[0].id}`);
        return data.records[0].id;
      } else {
        console.log(`  ℹ No TIKTOK POSTING record found for video_id: ${videoId}`);
        return null;
      }
    }

    console.error(`  API error searching TIKTOK POSTING: ${searchResponse.status}`);
    return null;
  } catch (error) {
    console.error(`  Error finding TIKTOK POSTING record:`, error);
    return null;
  }
}

/**
 * Update TIKTOK POSTING record's api_post_id text field with scraped video_id
 */
async function updatePostingApiPostId(postingRecordId: string, videoId: string): Promise<boolean> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_POSTING_TABLE_ID}/${postingRecordId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          api_post_id: videoId, // Long text field - send as string
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  Update failed: ${response.status} - ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`  Error updating api_post_id:`, error);
    return false;
  }
}

/**
 * Process a single post
 */
async function processPost(post: TikTokPost): Promise<{
  success: boolean;
  csv_video_id?: string;
  video_id?: string;
  error?: string;
}> {
  // Skip posts without csv_video_id
  if (!post.csv_video_id) {
    return {
      success: false,
      error: 'No csv_video_id',
    };
  }

  console.log(`\nProcessing csv_video_id: ${post.csv_video_id}`);

  // Find the record in Airtable by video_id
  console.log(`  Finding record in Airtable...`);
  const record = await findRecordByVideoId(post.csv_video_id);

  if (!record) {
    console.log(`  ❌ No record found with video_id: ${post.csv_video_id}`);
    return {
      success: false,
      csv_video_id: post.csv_video_id,
      error: 'Record not found in Airtable',
    };
  }

  console.log(`  ✓ Found Content record: ${record.id}`);

  // Step 1: Find existing TIKTOK POSTING record using csv_video_id
  console.log(`  Finding TIKTOK POSTING record for video_id: ${post.csv_video_id}`);

  const searchUrl = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_POSTING_TABLE_ID}`);
  searchUrl.searchParams.append('filterByFormula', `{video_id} = '${post.csv_video_id}'`);
  searchUrl.searchParams.append('maxRecords', '1');

  const searchResponse = await fetch(searchUrl.toString(), {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
  });

  if (!searchResponse.ok) {
    console.log(`  ❌ Failed to fetch TIKTOK POSTING record`);
    return {
      success: false,
      csv_video_id: post.csv_video_id,
      video_id: post.video_id,
      error: 'TIKTOK POSTING record not found',
    };
  }

  const postingData: AirtableResponse = await searchResponse.json();
  if (postingData.records.length === 0) {
    console.log(`  ⊘ Skipping - no TIKTOK POSTING record found`);
    return {
      success: false,
      csv_video_id: post.csv_video_id,
      video_id: post.video_id,
      error: 'TIKTOK POSTING record not found',
    };
  }

  const postingRecordData = postingData.records[0];
  const postingRecordId = postingRecordData.id;

  console.log(`  ✓ Found TIKTOK POSTING record: ${postingRecordId}`);

  // Check if TIKTOK POSTING record already has api_post_id set
  const currentApiPostId = postingRecordData.fields['api_post_id'];
  if (currentApiPostId && typeof currentApiPostId === 'string' && currentApiPostId.trim() !== '') {
    console.log(`  ℹ TIKTOK POSTING record already has api_post_id: ${currentApiPostId}`);
    return {
      success: false,
      csv_video_id: post.csv_video_id,
      video_id: post.video_id,
      error: 'api_post_id already set',
    };
  }

  // Step 2: Update TIKTOK POSTING record's api_post_id with scraped video_id
  console.log(`  Updating TIKTOK POSTING api_post_id to: ${post.video_id}`);
  const updateSuccess = await updatePostingApiPostId(postingRecordId, post.video_id);

  if (updateSuccess) {
    console.log(`  ✓ Successfully updated TIKTOK POSTING ${postingRecordId} with video_id ${post.video_id}`);
    return {
      success: true,
      csv_video_id: post.csv_video_id,
      video_id: post.video_id,
    };
  } else {
    console.log(`  ❌ Failed to update api_post_id`);
    return {
      success: false,
      csv_video_id: post.csv_video_id,
      video_id: post.video_id,
      error: 'Failed to update api_post_id',
    };
  }
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  const inputPath = 'scripts/tiktok-posts.json';

  // Read the JSON file
  console.log('Reading tiktok-posts.json...');
  const fileContent = fs.readFileSync(inputPath, 'utf-8');
  const posts: TikTokPost[] = JSON.parse(fileContent);

  console.log(`Found ${posts.length} total posts`);

  // Filter posts that have csv_video_id
  const postsWithCsvVideoId = posts.filter(p => p.csv_video_id);
  console.log(`${postsWithCsvVideoId.length} posts have csv_video_id`);

  if (postsWithCsvVideoId.length === 0) {
    console.log('\nNo posts with csv_video_id to process. Exiting.');
    return;
  }

  // Track results
  const results: Array<{
    success: boolean;
    csv_video_id?: string;
    video_id?: string;
    error?: string;
  }> = [];

  // Process in batches to respect rate limits
  console.log(`\nProcessing ${postsWithCsvVideoId.length} posts in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < postsWithCsvVideoId.length; i += BATCH_SIZE) {
    const batch = postsWithCsvVideoId.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(postsWithCsvVideoId.length / BATCH_SIZE);

    console.log(`\n=== Batch ${batchNumber}/${totalBatches} (${batch.length} posts) ===`);

    // Process batch sequentially to avoid rate limits
    for (const post of batch) {
      const result = await processPost(post);
      results.push(result);

      // Small delay between requests to be nice to the API
      await sleep(200); // 200ms delay
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const skippedNoCsvVideoId = posts.length - postsWithCsvVideoId.length;
  const contentNotFound = results.filter(r => r.error === 'Record not found in Airtable').length;
  const alreadySet = results.filter(r => r.error === 'api_post_id already set').length;
  const postingNotFound = results.filter(r => r.error === 'TIKTOK POSTING record not found').length;
  const failedToUpdate = results.filter(r => r.error === 'Failed to update api_post_id').length;

  console.log(`Total posts in JSON:              ${posts.length}`);
  console.log(`Posts with csv_video_id:          ${postsWithCsvVideoId.length}`);
  console.log(`Posts without csv_video_id:       ${skippedNoCsvVideoId}`);
  console.log(`\nResults:`);
  console.log(`  ✓ Successfully updated:          ${successful}`);
  console.log(`  ℹ Already had api_post_id:       ${alreadySet}`);
  console.log(`  ⊘ TIKTOK POSTING not found:      ${postingNotFound}`);
  console.log(`  ❌ Content record not found:     ${contentNotFound}`);
  console.log(`  ❌ Failed to update:             ${failedToUpdate}`);

  // Save detailed results to file
  const outputPath = 'scripts/airtable-update-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nDetailed results saved to: ${outputPath}`);
}

main().catch(console.error);
