import { v } from "convex/values";
import { action } from "../_generated/server";

// Airtable configuration - these should come from environment variables
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_CAMPAIGN_TABLE_ID = "tblDKeX3BOFuLCucu";
const AIRTABLE_ARTIST_TABLE_ID = "tblGoMJr5XOVFx50O";
const AIRTABLE_CONTENT_TABLE_ID = "tbleqHUKb7il998rO";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface CampaignOutput {
  id: string;
  campaign_id: string;
  artist: string;
  song: string;
}

interface ContentItem {
  id: string;
  video_url?: string;
  account_niche: string;
  video_category: string;
  api_post_id?: string;
}

// Helper function to fetch records from Airtable
async function fetchRecords(
  tableId: string,
  filterFormula?: string,
  fields?: string[]
): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);

    if (filterFormula) url.searchParams.append("filterByFormula", filterFormula);
    if (fields) fields.forEach((field) => url.searchParams.append("fields[]", field));
    if (offset) url.searchParams.append("offset", offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data: AirtableResponse = (await response.json()) as AirtableResponse;
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

// Helper function to fetch a single record by ID
async function fetchRecordById(
  tableId: string,
  recordId: string
): Promise<AirtableRecord | null> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AirtableRecord;
}

/**
 * Fetch all active campaigns from Airtable
 */
export const getCampaigns = action({
  args: {},
  handler: async (): Promise<CampaignOutput[]> => {
    const records = await fetchRecords(
      AIRTABLE_CAMPAIGN_TABLE_ID,
      '{Status} = "Active"',
      ["campaign_id", "Artist / Song", "Status"]
    );

    const outputData: CampaignOutput[] = [];

    for (const record of records) {
      const output: CampaignOutput = {
        id: record.id,
        campaign_id: record.fields["campaign_id"] as string,
        artist: "",
        song: "",
      };

      // Fetch artist and song details from related table
      const artistSongIds = record.fields["Artist / Song"] as string[] | undefined;
      if (artistSongIds?.[0]) {
        const artistRecord = await fetchRecordById(AIRTABLE_ARTIST_TABLE_ID, artistSongIds[0]);
        if (artistRecord) {
          output.artist = (artistRecord.fields["Artist"] as string) || "";
          output.song = (artistRecord.fields["Song"] as string) || "";
        }
      }

      outputData.push(output);
    }

    return outputData;
  },
});

/**
 * Fetch all content for a specific campaign
 */
export const getCampaignContent = action({
  args: {
    campaignRecordId: v.string(),
  },
  handler: async (ctx, args): Promise<{ content: ContentItem[]; campaign_id: string }> => {
    // First, get the campaign to extract campaign_id
    const campaign = await fetchRecordById(AIRTABLE_CAMPAIGN_TABLE_ID, args.campaignRecordId);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const campaignId = campaign.fields["campaign_id"] as string;
    if (!campaignId) {
      throw new Error("Campaign has no campaign_id");
    }

    // Fetch all content for this campaign
    const allRecords: ContentItem[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTENT_TABLE_ID}`
      );

      url.searchParams.append("filterByFormula", `{campaign_id} = '${campaignId}'`);
      url.searchParams.append("fields[]", "video_url");
      url.searchParams.append("fields[]", "account_niche");
      url.searchParams.append("fields[]", "video_category");
      url.searchParams.append("fields[]", "api_post_id");

      if (offset) url.searchParams.append("offset", offset);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data: AirtableResponse = (await response.json()) as AirtableResponse;

      data.records.forEach((record) => {
        // account_niche is an array in Airtable, take first element
        const accountNiche = record.fields["account_niche"] as string[] | undefined;
        const apiPostId = record.fields["api_post_id"] as string[] | undefined;

        allRecords.push({
          id: record.id,
          video_url: record.fields["video_url"] as string | undefined,
          account_niche: accountNiche?.[0] || "",
          video_category: (record.fields["video_category"] as string) || "",
          api_post_id: apiPostId?.[0] as string | undefined,
        });
      });

      offset = data.offset;
    } while (offset);

    return {
      content: allRecords,
      campaign_id: campaignId,
    };
  },
});
