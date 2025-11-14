import * as fs from 'fs';
import * as path from 'path';

// API Configuration
const TOKAPI_BASE_URL = 'http://api.tokapi.online';
const TOKAPI_KEY = '808a45b29cf9422798bcc4560909b4c2';
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

interface CSVRecord {
  username: string;
  campaign_id: string;
  post_caption: string;
  video_id: string;
}

interface UserIdResponse {
  status_code: number;
  uid?: string;
  sec_uid?: string;
  extra?: any;
  log_pb?: any;
}

interface PostsResponse {
  status_code: number;
  aweme_list?: any[];
  has_more?: number;
  max_cursor?: number;
  min_cursor?: number;
  extra?: any;
  log_pb?: any;
}

/**
 * Custom CSV parser that handles quoted fields, escaped quotes, and multi-line values
 */
function parseCSVRow(csv: string, startIndex: number): { fields: string[], nextIndex: number } | null {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = startIndex;

  while (i < csv.length) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
        i++;
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
        i++;
      } else if (char === ',') {
        // Field separator
        fields.push(currentField);
        currentField = '';
        i++;
      } else if (char === '\n') {
        // End of row
        fields.push(currentField);
        return { fields, nextIndex: i + 1 };
      } else if (char === '\r' && nextChar === '\n') {
        // End of row (Windows)
        fields.push(currentField);
        return { fields, nextIndex: i + 2 };
      } else {
        currentField += char;
        i++;
      }
    }
  }

  // End of file
  if (currentField || fields.length > 0) {
    fields.push(currentField);
    return { fields, nextIndex: i };
  }

  return null;
}

/**
 * Parse CSV file and extract campaign data
 */
function parseCSVData(filePath: string): { usernames: string[], records: CSVRecord[] } {
  console.log('Reading CSV file...');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '');

  console.log('Parsing CSV...');

  // Parse header
  const headerResult = parseCSVRow(cleanContent, 0);
  if (!headerResult) {
    throw new Error('Failed to parse CSV header');
  }

  const headers = headerResult.fields;
  const postedUsernameIndex = headers.indexOf('posted_username');
  const campaignIdIndex = headers.indexOf('campaign_id');
  const postCaptionIndex = headers.indexOf('post_caption');
  const videoIdIndex = headers.indexOf('video_id');

  if (postedUsernameIndex === -1) {
    throw new Error('Column "posted_username" not found in CSV');
  }
  if (campaignIdIndex === -1) {
    throw new Error('Column "campaign_id" not found in CSV');
  }
  if (postCaptionIndex === -1) {
    throw new Error('Column "post_caption" not found in CSV');
  }
  if (videoIdIndex === -1) {
    throw new Error('Column "video_id" not found in CSV');
  }

  console.log(`Found columns - posted_username: ${postedUsernameIndex}, campaign_id: ${campaignIdIndex}, post_caption: ${postCaptionIndex}, video_id: ${videoIdIndex}`);

  // Parse rows and extract data
  const usernamesSet = new Set<string>();
  const records: CSVRecord[] = [];
  let currentIndex = headerResult.nextIndex;
  let rowCount = 0;

  while (currentIndex < cleanContent.length) {
    const rowResult = parseCSVRow(cleanContent, currentIndex);
    if (!rowResult) break;

    // Skip empty rows
    if (rowResult.fields.every(f => !f.trim())) {
      currentIndex = rowResult.nextIndex;
      continue;
    }

    const username = rowResult.fields[postedUsernameIndex]?.trim();
    const campaignId = rowResult.fields[campaignIdIndex]?.trim();
    const postCaption = rowResult.fields[postCaptionIndex]?.trim();
    const videoId = rowResult.fields[videoIdIndex]?.trim();

    if (username) {
      usernamesSet.add(username);

      if (campaignId && postCaption && videoId) {
        records.push({
          username,
          campaign_id: campaignId,
          post_caption: postCaption,
          video_id: videoId
        });
      }
    }

    rowCount++;
    currentIndex = rowResult.nextIndex;
  }

  const uniqueUsernames = Array.from(usernamesSet);
  console.log(`Parsed ${rowCount} rows, found ${uniqueUsernames.length} unique usernames, ${records.length} campaign records`);

  return { usernames: uniqueUsernames, records };
}

/**
 * Normalize caption for matching (remove everything after first #, keep only a-z characters)
 */
function normalizeCaption(caption: string): string {
  // Remove everything from the first # onwards (including the #)
  const beforeHashtag = caption.split('#')[0] || '';
  // Convert to lowercase and keep only a-z characters (removes numbers, emojis, punctuation, spaces, etc.)
  return beforeHashtag.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Find matching campaign data for a post
 */
function findCampaignData(username: string, desc: string, csvRecords: CSVRecord[]): { campaign_id: string; csv_video_id: string } | undefined {
  const normalizedDesc = normalizeCaption(desc);

  // Find matching records for this username
  const userRecords = csvRecords.filter(r => r.username === username);

  // Try partial match (CSV caption contains the desc or vice versa)
  for (const record of userRecords) {
    const normalizedCaption = normalizeCaption(record.post_caption);
    if (normalizedCaption.includes(normalizedDesc) || normalizedDesc.includes(normalizedCaption)) {
      return {
        campaign_id: record.campaign_id,
        csv_video_id: record.video_id
      };
    }
  }

  return undefined;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make API request with retry logic
 */
async function makeAPIRequest<T>(url: string, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-project-name': 'tokapi',
          'x-api-key': TOKAPI_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`  Attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY * attempt); // Exponential backoff
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Get user ID by username
 */
async function getUserByUsername(username: string): Promise<string | null> {
  try {
    const url = `${TOKAPI_BASE_URL}/v1/user/username/${username}`;
    const data = await makeAPIRequest<UserIdResponse>(url);

    if (data.status_code !== 0 || !data.uid) {
      console.error(`  Failed to get user ID for ${username}: status_code=${data.status_code}`);
      return null;
    }

    return data.uid;
  } catch (error) {
    console.error(`  Error getting user ID for ${username}:`, error);
    return null;
  }
}

/**
 * Fetch all posts for a user with pagination
 */
async function getAllUserPosts(userId: string, username: string, csvRecords: CSVRecord[]): Promise<TikTokPost[]> {
  const posts: TikTokPost[] = [];
  let offset = 0;
  let hasMore = true;
  let pageCount = 0;

  while (hasMore) {
    try {
      const url = `${TOKAPI_BASE_URL}/v1/post/user/${userId}/posts?count=30&offset=${offset}&region=US&with_pinned_posts=1`;
      const data = await makeAPIRequest<PostsResponse>(url);

      if (data.status_code !== 0) {
        console.error(`  Failed to fetch posts for ${username}: status_code=${data.status_code}`);
        break;
      }

      if (!data.aweme_list || data.aweme_list.length === 0) {
        break;
      }

      pageCount++;

      // Extract post data
      for (const aweme of data.aweme_list) {
        const stats = aweme.statistics || {};
        const desc = aweme.desc || '';

        // Try to find matching campaign data
        const campaignData = findCampaignData(username, desc, csvRecords);

        // Only save posts that have a campaign_id
        if (campaignData) {
          const post: TikTokPost = {
            video_id: aweme.aweme_id || '',
            desc,
            views: stats.play_count || 0,
            likes: stats.digg_count || 0,
            comments: stats.comment_count || 0,
            shares: stats.share_count || 0,
            saves: stats.collect_stat || 0,
            postedAt: aweme.create_time || 0,
            username,
            campaign_name: campaignData.campaign_id,
            csv_video_id: campaignData.csv_video_id
          };

          posts.push(post);
        }
      }

      console.log(`  Fetched page ${pageCount}: ${data.aweme_list.length} posts fetched, ${posts.length} with campaign match so far`);

      // Check if there are more posts
      hasMore = data.has_more === 1;

      if (hasMore && data.max_cursor) {
        offset = data.max_cursor;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`  Error fetching posts for ${username}:`, error);
      break;
    }
  }

  return posts;
}

/**
 * Process a single username
 */
async function processUsername(username: string, csvRecords: CSVRecord[]): Promise<TikTokPost[]> {
  console.log(`\nProcessing: ${username}`);

  // Get user ID
  console.log('  Getting user ID...');
  const userId = await getUserByUsername(username);

  if (!userId) {
    console.error(`  Skipping ${username}: Could not get user ID`);
    return [];
  }

  console.log(`  User ID: ${userId}`);

  // Fetch all posts
  console.log('  Fetching posts...');
  const posts = await getAllUserPosts(userId, username, csvRecords);

  if (posts.length === 0) {
    console.log(`  No posts with campaign match found for ${username}`);
  } else {
    console.log(`  Found ${posts.length} posts with campaign match`);
  }

  return posts;
}

/**
 * Process usernames in batches
 */
async function processBatch(usernames: string[], csvRecords: CSVRecord[]): Promise<TikTokPost[]> {
  const promises = usernames.map(username => processUsername(username, csvRecords));
  const results = await Promise.all(promises);
  return results.flat();
}

/**
 * Main function
 */
async function main() {
  const csvPath = 'scripts/Content-Kuben Scrape.csv';
  const outputPath = 'scripts/tiktok-posts.json';

  // Parse CSV to get usernames and campaign records
  const { usernames: allUsernames, records: csvRecords } = parseCSVData(csvPath);

  console.log(`\nTotal unique usernames: ${allUsernames.length}`);
  console.log(`Total CSV records with campaign data: ${csvRecords.length}`);

  // Collect all posts
  const allPosts: TikTokPost[] = [];

  // Process in batches
  console.log(`\nProcessing ${allUsernames.length} usernames in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < allUsernames.length; i += BATCH_SIZE) {
    const batch = allUsernames.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allUsernames.length / BATCH_SIZE);

    console.log(`\n=== Batch ${batchNumber}/${totalBatches} (${batch.length} usernames) ===`);
    const batchPosts = await processBatch(batch, csvRecords);
    allPosts.push(...batchPosts);

    console.log(`\nBatch ${batchNumber} complete. Total posts collected so far: ${allPosts.length}`);
  }

  // Save all posts to single JSON file
  console.log(`\nSaving ${allPosts.length} posts to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(allPosts, null, 2), 'utf-8');

  console.log(`\n✓ All usernames processed successfully!`);
  console.log(`  Total posts with campaign match: ${allPosts.length}`);
  console.log(`  Saved to: ${outputPath}`);
}

main().catch(console.error);
