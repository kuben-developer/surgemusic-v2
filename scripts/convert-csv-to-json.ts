import * as fs from 'fs';

interface OutputRecord {
  campaignId: string;
  username: string;
  tiktokVideoId: string;
}

function extractCampaignId(campaignUrl: string): string {
  const match = campaignUrl.match(/\/campaign\/([a-z0-9]+)/i);
  return match?.[1] || '';
}

function extractTikTokVideoId(videoUrl: string): string {
  const match = videoUrl.match(/\/video\/(\d+)/);
  return match?.[1] || '';
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
  const accountIndex = headers.indexOf('Account');
  const postedLinkIndex = headers.indexOf('posted_link');
  const campaignIdIndex = headers.indexOf('campaign_id');

  if (accountIndex === -1 || postedLinkIndex === -1 || campaignIdIndex === -1) {
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

    const account = fields[accountIndex]?.trim();
    const postedLink = fields[postedLinkIndex]?.trim();
    const campaignUrl = fields[campaignIdIndex]?.trim();

    if (!account || !postedLink || !campaignUrl) continue;

    const campaignId = extractCampaignId(campaignUrl);
    const tiktokVideoId = extractTikTokVideoId(postedLink);

    if (campaignId && tiktokVideoId) {
      results.push({
        campaignId,
        username: account,
        tiktokVideoId
      });
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
