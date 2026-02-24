# Plan: Unified Convex Content Table + Fast Campaign Page

## Context

The campaign content page (`/campaign/[id]`) is extremely slow — `useCampaignContent` makes sequential Airtable HTTP calls for 50k+ records. Additionally, the existing `airtableContents` table is incomplete (lacks UI fields like `videoUrl`, `videoCategory`) and only stores records with postIds.

**Goal:** Create a unified `campaignContent` table that is a complete Convex mirror of Airtable content data. This becomes the single source of truth — serving both the campaign UI and analytics. In the future, new Airtable columns map to new fields here, and eventually Airtable can be dropped entirely.

## Convex Constraints

| Constraint | Limit | Design Response |
|-----------|-------|-----------------|
| Docs scanned per query | 16,384 | Use compound indexes + filtered queries. Never scan all 50k. |
| Docs written per mutation | 8,192 | Batch size 4,000 for inserts/deletes/patches. |
| v.array() per document | 8,192 | Pre-computed stats arrays stay under ~1,200 entries. |
| Query result size | 8 MB | Paginated queries for content. Stats from 1-doc read. |
| Action timeout / memory | 10 min / 512 MB | Sync processes 50k in memory. Diff-based updates minimize mutations. |

## Changes

### 1. Schema: New `campaignContent` table
**File:** `convex/schema.ts`

Replaces `airtableContents`. Stores ALL Airtable content records (including planned).

```typescript
campaignContent: defineTable({
  // Identity
  campaignId: v.string(),
  airtableRecordId: v.string(),

  // Content fields (synced from Airtable)
  videoUrl: v.optional(v.string()),
  accountNiche: v.optional(v.string()),
  videoCategory: v.optional(v.string()),
  apiPostId: v.optional(v.string()),
  date: v.optional(v.string()),
  status: v.optional(v.string()),
  isManual: v.optional(v.boolean()),
  tiktokId: v.optional(v.string()),

  // Computed fields (set during sync)
  postId: v.optional(v.string()),    // = apiPostId || (isManual ? tiktokId : undefined)
  uiStatus: v.optional(v.string()),  // = "planned" | "scheduled" | "published"

  // Analytics fields (set by analytics pipeline, preserved across syncs)
  caption: v.optional(v.string()),
  error: v.optional(v.string()),
  errorAt: v.optional(v.number()),
})
  .index("by_campaignId", ["campaignId"])
  .index("by_airtableRecordId", ["airtableRecordId"])
  .index("by_postId", ["postId"])
  .index("by_campaignId_postId", ["campaignId", "postId"])
  .index("by_error", ["error"])
  .index("by_campaignId_category_uiStatus", ["campaignId", "videoCategory", "uiStatus"])
```

### 2. Schema: Add cached stats to `campaigns` table
**File:** `convex/schema.ts`

```typescript
// Add to existing campaigns table:
cachedContentStats: v.optional(v.array(v.object({
  videoCategory: v.string(),
  total: v.number(),
  planned: v.number(),
  scheduled: v.number(),
  published: v.number(),
}))),
cachedContentDateStats: v.optional(v.array(v.object({
  videoCategory: v.string(),
  date: v.union(v.string(), v.null()),
  scheduled: v.number(),
  published: v.number(),
}))),
cachedContentSyncedAt: v.optional(v.number()),
```

### 3. Backend: Extract Airtable fetch helper
**File:** `convex/app/airtable.ts`

Extract from `getCampaignContent` into a standalone helper:
```typescript
async function fetchAllCampaignContentFromAirtable(campaignRecordId: string): Promise<{
  content: ContentItem[];
  campaignId: string;
  campaignName: string;
  artist: string;
  song: string;
}>
```
Returns ALL records in memory (no 5000-record truncation). `getCampaignContent` refactored to call this helper + apply pagination slice (behavior unchanged for any remaining callers).

### 4. Backend: Diff-based sync mutations
**File:** `convex/app/airtable.ts`

**`getContentByAirtableRecordIds`** (internalQuery):
- Paginated read of existing `campaignContent` records by campaignId
- Returns page of records + cursor for next page

**`upsertContentBatch`** (internalMutation):
- Takes array of `{ _id?: Id, ...fields }` items (up to 4,000)
- For items with `_id`: `ctx.db.patch(_id, contentFields)` — preserves analytics fields
- For items without `_id`: `ctx.db.insert("campaignContent", allFields)`

**`deleteContentBatch`** (internalMutation):
- Takes array of document IDs (up to 4,000)
- Deletes each

**`updateCachedContentStats`** (internalMutation):
- Patches campaigns document with pre-computed stats

### 5. Backend: Rewrite `syncAirtableContentByCampaign`
**File:** `convex/app/airtable.ts` (existing function, ~line 411)

Complete rewrite using diff-based approach:
1. **Fetch from Airtable:** Call `fetchAllCampaignContentFromAirtable` (all 50k records in memory)
2. **Read existing from Convex:** Paginated reads via `getContentByAirtableRecordIds` (loop until all pages read). Build `Map<airtableRecordId, existingDoc>`.
3. **Diff:** Compare incoming vs existing by `airtableRecordId`:
   - **New:** in incoming, not in existing → insert
   - **Changed:** in both, content fields differ → patch (only content fields; preserves `caption`, `error`, `errorAt`)
   - **Deleted:** in existing, not in incoming → delete
   - **Unchanged:** skip
4. **Apply:** Call `upsertContentBatch` for inserts+patches, `deleteContentBatch` for deletes (batches of 4,000)
5. **Stats:** Compute per-category and per-date counts in memory, call `updateCachedContentStats`
6. **Analytics (existing):** Existing logic for counting `total`/`published` and calling `upsertCampaign` remains

First sync: all 50k are new → ~13 insert batches (~30 seconds).
Subsequent syncs: typically ~100-500 changes → 1 batch (~2 seconds).

### 6. Backend: Queries
**File:** `convex/app/airtable.ts`

**`getCampaignContentStats`** (public query):
- Reads from `campaigns` table by `campaignId` index (1 document read)
- Returns pre-computed stats + campaign metadata

**`getCampaignContentByCategory`** (public query with pagination):
- Uses `by_campaignId_category_uiStatus` compound index
- Accepts `{ campaignId, videoCategory, uiStatus?, paginationOpts }`
- Returns paginated results. Each page reads ~20-50 docs.

**`getPlannedRecordsByCategory`** (public query):
- Queries with `uiStatus = "planned"` using compound index
- Returns `Array<{ id, date }>` for Montager dialog (loaded lazily)

**`refreshCampaignContent`** (public action):
- Schedules `syncAirtableContentByCampaign` via `ctx.scheduler.runAfter(0, ...)`

### 7. Backend: Update analytics consumers
**File:** `convex/app/analyticsV2.ts`

**`getAirtablePostsByCampaign`** (line 178):
- Change table from `"airtableContents"` to `"campaignContent"`
- Use `by_campaignId_postId` index with `.gt("postId", "")` to skip planned records (undefined sorts before all strings in Convex)
- This returns only records with postId (~20k), staying under 16,384 scan limit

**File:** `convex/webhooks/campaignAnalyticsQueries.ts` (3 places ~lines 87-90, 149-155, 207-213)

Same change: `"airtableContents"` → `"campaignContent"`, add `by_campaignId_postId` index filter.

**File:** `convex/app/airtable.ts`

- `checkContentExists` → change table, keep `by_postId` index logic
- `getContentByCampaign` → change table, add postId filter if needed
- `insertContent` → keep for backward compat but sync no longer calls it

### 8. Frontend: Rewrite `useCampaignContent` hook
**File:** `src/features/campaign/content/hooks/useCampaignContent.ts`

```typescript
export function useCampaignContent(campaignRecordId: string) {
  const stats = useQuery(api.app.airtable.getCampaignContentStats,
    campaignRecordId ? { campaignId: campaignRecordId } : "skip");
  const refreshAction = useAction(api.app.airtable.refreshCampaignContent);
  return {
    stats,
    isLoading: stats === undefined,
    refresh: () => refreshAction({ campaignRecordId }),
  };
}
```

### 9. Frontend: New `useCategoryContent` hook
**File:** `src/features/campaign/content/hooks/useCategoryContent.ts` (new)

```typescript
export function useCategoryContent(campaignId, videoCategory, uiStatus) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.app.airtable.getCampaignContentByCategory,
    videoCategory && uiStatus ? { campaignId, videoCategory, uiStatus } : "skip",
    { initialNumItems: 20 }
  );
  return { results, status, loadMore };
}
```

### 10. Frontend: Update `CampaignContentPage`
**File:** `src/features/campaign/content/CampaignContentPage.tsx`

- **Category cards (lines 77-140):** Read from `stats.categories` + overlay montager counts
- **Tab badge counts:** From pre-computed stats
- **Date stats (lines 244-277):** From `stats.dateStats` filtered by category
- **Video grid — scheduled/published:** Use `useCategoryContent` paginated query
- **Video grid — processing/ready:** Unchanged (montager queries)
- **Unassigned records:** Use `getPlannedRecordsByCategory`, loaded lazily for Montager dialog
- **Add refresh button** near CampaignInfoCard

### 11. Frontend: Adapt `VideoGrid`
**File:** `src/features/campaign/content/components/VideoGrid.tsx`

For `scheduled`/`published` variants:
- Accept paginated results + `loadMore` callback
- Call `loadMore(20)` in intersection observer

## Migration Strategy

1. Deploy new `campaignContent` table + all new backend functions
2. Keep `airtableContents` temporarily (existing analytics reads from it)
3. Run first sync — populates `campaignContent` from Airtable
4. Update analytics consumers to read from `campaignContent`
5. Deploy frontend changes
6. Verify everything works end-to-end
7. Mark `airtableContents` as deprecated, remove in follow-up PR

## Files Modified

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `campaignContent` table; add stats fields to `campaigns` |
| `convex/app/airtable.ts` | Extract fetch helper; rewrite sync; add batch mutations, queries, refresh action; update internal queries |
| `convex/app/analyticsV2.ts` | Update `getAirtablePostsByCampaign` → use new table + postId filter |
| `convex/webhooks/campaignAnalyticsQueries.ts` | Update 3 queries → use new table + postId filter |
| `src/features/campaign/content/hooks/useCampaignContent.ts` | Rewrite: stats query + refresh |
| `src/features/campaign/content/hooks/useCategoryContent.ts` | **New**: paginated content hook |
| `src/features/campaign/content/CampaignContentPage.tsx` | Pre-computed stats, paginated queries, refresh button |
| `src/features/campaign/content/components/VideoGrid.tsx` | Accept paginated data for scheduled/published |

## Verification

1. `npx convex dev` to deploy schema + functions
2. Trigger sync: call `refreshCampaignContent` for a test campaign
3. Check Convex dashboard: `campaignContent` table populated with all records
4. Verify analytics still work: campaign analytics page shows correct totals
5. Open campaign content page — instant load via pre-computed stats + paginated queries
6. Verify category cards, tab switching, date filtering all work
7. Test refresh button
8. `pnpm typecheck | grep -v old_convex` for type errors
