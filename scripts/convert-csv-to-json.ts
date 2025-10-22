import * as fs from 'fs';

interface OutputRecord {
  campaignId?: string;
  tiktokVideoId?: string;
  referenceId?: string;
  api_post_id?: string;
}

function extractCampaignIdFromUrl(campaignValue: string): string | null {
  // Check if it's a plain number
  if (/^\d+$/.test(campaignValue)) {
    return null; // This should be handled as referenceId instead
  }

  // Extract from URL like https://app.surgemusic.io/campaign/j97afad8j8kvcdxytw5m3ztb1x7sd7fg
  const match = campaignValue.match(/\/campaign\/([a-z0-9]+)/i);
  return match?.[1] || null;
}

function extractTikTokVideoId(videoUrl: string | undefined): string | null {
  if (!videoUrl) return null;

  const match = videoUrl.match(/\/video\/(\d+)/);
  return match?.[1] || null;
}

function isValidCampaignValue(value: string): boolean {
  // Valid if it's a number OR a URL
  if (/^\d+$/.test(value)) return true;
  if (value.includes('/campaign/')) return true;
  return false;
}

function parseCSVRow(csv: string, startIndex: number): { fields: string[], nextIndex: number } | null {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = startIndex;

  while (i < csv.length) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote
      currentField += '"';
      i += 2;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
      i++;
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      fields.push(currentField);

      // Skip any additional newline characters
      while (i < csv.length && (csv[i] === '\n' || csv[i] === '\r')) {
        i++;
      }

      return { fields, nextIndex: i };
    }

    currentField += char;
    i++;
  }

  // End of file
  if (currentField || fields.length > 0) {
    fields.push(currentField);
    return { fields, nextIndex: i };
  }

  return null;
}

function parseCSV(content: string): OutputRecord[] {
  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '');

  // Parse header row
  const headerResult = parseCSVRow(cleanContent, 0);
  if (!headerResult) {
    throw new Error('Failed to parse CSV header');
  }

  const headers = headerResult.fields.map(h => h.trim());
  const postedLinkIndex = headers.indexOf('posted_link');
  const campaignIdIndex = headers.indexOf('campaign_id');
  const apiPostIdIndex = headers.indexOf('api_post_id');

  if (postedLinkIndex === -1 || campaignIdIndex === -1) {
    throw new Error(`Required columns not found. Available columns: ${headers.join(', ')}`);
  }

  const results: OutputRecord[] = [];
  let currentIndex = headerResult.nextIndex;

  // Parse data rows
  while (currentIndex < cleanContent.length) {
    const rowResult = parseCSVRow(cleanContent, currentIndex);
    if (!rowResult) break;

    const fields = rowResult.fields;
    currentIndex = rowResult.nextIndex;

    // Skip empty rows
    if (fields.every(f => !f.trim())) continue;

    const postedLink = fields[postedLinkIndex]?.trim();
    const campaignValue = fields[campaignIdIndex]?.trim();
    const apiPostId = apiPostIdIndex !== -1 ? fields[apiPostIdIndex]?.trim() : undefined;

    // Skip if campaign_id is not valid (not a number and not a URL)
    if (!campaignValue || !isValidCampaignValue(campaignValue)) {
      continue;
    }

    const record: OutputRecord = {};

    // Handle campaign_id: if it's a number, it's referenceId; if URL, extract campaignId
    if (/^\d+$/.test(campaignValue)) {
      record.referenceId = campaignValue;
    } else {
      const extractedCampaignId = extractCampaignIdFromUrl(campaignValue);
      if (extractedCampaignId) {
        record.campaignId = extractedCampaignId;
      }
    }

    // Extract TikTok video ID if posted_link is a TikTok link
    const tiktokVideoId = extractTikTokVideoId(postedLink);
    if (tiktokVideoId) {
      record.tiktokVideoId = tiktokVideoId;
    }

    // Include api_post_id if available
    if (apiPostId) {
      record.api_post_id = apiPostId;
    }

    // Only add the record if it has at least one field
    if (Object.keys(record).length > 0) {
      results.push(record);
    }
  }

  return results;
}

function main() {
  const inputPath = "scripts/input.csv"
  const outputPath = "scripts/output.json"

  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(inputPath, 'utf-8');

  console.log('Parsing CSV...');
  const records = parseCSV(csvContent);

  console.log(`Parsed ${records.length} records`);

  console.log('Writing JSON file...');
  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), 'utf-8');

  console.log(`Successfully converted CSV to JSON at ${outputPath}`);
}

main();
