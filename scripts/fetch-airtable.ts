import * as fs from 'fs';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appxjuaDSRBQ5Sv5T';
const AIRTABLE_CAMPAIGN_TABLE_ID = 'tblDKeX3BOFuLCucu';
const AIRTABLE_ARTIST_TABLE_ID = 'tblGoMJr5XOVFx50O';

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

interface CampaignOutput {
  id: string;
  campaign_id: string;
  artist?: string;
  song?: string;
}

async function fetchRecords(
  tableId: string,
  filterFormula?: string,
  fields?: string[]
): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);

    if (filterFormula) url.searchParams.append('filterByFormula', filterFormula);
    if (fields) fields.forEach(field => url.searchParams.append('fields[]', field));
    if (offset) url.searchParams.append('offset', offset);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: AirtableResponse = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function fetchRecordById(tableId: string, recordId: string): Promise<AirtableRecord | null> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
  });

  return response.ok ? await response.json() : null;
}

async function main() {
  const records = await fetchRecords(
    AIRTABLE_CAMPAIGN_TABLE_ID,
    '{Status} = "Active"',
    ['campaign_id', 'Artist / Song', 'Status']
  );

  const outputData: CampaignOutput[] = [];

  for (const record of records) {
    const output: CampaignOutput = {
      id: record.id,
      campaign_id: record.fields['campaign_id'] as string,
    };

    const artistSongIds = record.fields['Artist / Song'] as string[] | undefined;
    if (artistSongIds?.[0]) {
      const artistRecord = await fetchRecordById(AIRTABLE_ARTIST_TABLE_ID, artistSongIds[0]);
      if (artistRecord) {
        output.artist = artistRecord.fields['Artist'] as string;
        output.song = artistRecord.fields['Song'] as string;
      }
    }

    outputData.push(output);
  }

  fs.writeFileSync('scripts/airtable-output.json', JSON.stringify(outputData, null, 2));
}

main().catch(console.error);
