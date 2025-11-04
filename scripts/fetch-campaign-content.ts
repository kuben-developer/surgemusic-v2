import * as fs from 'fs';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appxjuaDSRBQ5Sv5T';
const AIRTABLE_CAMPAIGN_TABLE_ID = 'tblDKeX3BOFuLCucu';
const AIRTABLE_CONTENT_TABLE_ID = 'tbleqHUKb7il998rO';

if (!AIRTABLE_API_KEY) {
  console.error('Error: AIRTABLE_API_KEY environment variable is required');
  process.exit(1);
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface ContentItem {
  id: string;
  video_url?: string;
  account_niche?: string;
  video_category?: string;
  api_post_id?: string;
}

interface CampaignContentOutput {
  campaign_id: string;
  campaign_record_id: string;
  total_content_count: number;
  content: ContentItem[];
}

async function fetchRecordById(tableId: string, recordId: string): Promise<any> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
  });
  return response.ok ? await response.json() : null;
}

async function fetchContentByCampaignId(campaignId: string): Promise<ContentItem[]> {
  const allRecords: ContentItem[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTENT_TABLE_ID}`);

    url.searchParams.append('filterByFormula', `{campaign_id} = '${campaignId}'`);
    url.searchParams.append('fields[]', 'video_url');
    url.searchParams.append('fields[]', 'account_niche');
    url.searchParams.append('fields[]', 'video_category');
    url.searchParams.append('fields[]', 'api_post_id');

    if (offset) url.searchParams.append('offset', offset);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: AirtableResponse = await response.json();

    data.records.forEach(record => {
      allRecords.push({
        id: record.id,
        video_url: record.fields['video_url'] as string | undefined,
        account_niche: (record.fields['account_niche'] as string[])?.[0] as string | undefined,
        video_category: record.fields['video_category'] as string | undefined,
        api_post_id: (record.fields['api_post_id'] as string[])?.[0] as string | undefined,
      });
    });

    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function main() {
  const campaignRecordId = process.argv[2];

  if (!campaignRecordId) {
    console.error('Usage: npx tsx scripts/fetch-campaign-content.ts <campaign_record_id>');
    process.exit(1);
  }

  const campaign = await fetchRecordById(AIRTABLE_CAMPAIGN_TABLE_ID, campaignRecordId);
  if (!campaign) throw new Error('Campaign not found');

  const campaignId = campaign.fields['campaign_id'];
  if (!campaignId) throw new Error('Campaign has no campaign_id');

  const content = await fetchContentByCampaignId(campaignId);
  if (!content.length) throw new Error('No content found');

  const output: CampaignContentOutput = {
    campaign_id: campaignId,
    campaign_record_id: campaignRecordId,
    total_content_count: content.length,
    content,
  };

  fs.writeFileSync(
    `scripts/campaign-${campaignRecordId}-content.json`,
    JSON.stringify(output, null, 2)
  );
}

main().catch(console.error);
