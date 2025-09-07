# API-Posted Video Analytics Tracking – Implementation Plan

## Summary
We currently track analytics for manually posted videos only. This plan adds end-to-end support for API-posted (scheduled) videos published via Ayrshare. We'll:
- Add a new Convex table `ayrsharePostedVideos` (same shape as `manuallyPostedVideos`).
- Create a cron-driven backend workflow to fetch analytics from Ayrshare `POST /api/analytics/post` for each scheduled post and upsert into `ayrsharePostedVideos`.
- Merge API-posted analytics with existing manual analytics in our existing analytics pipeline so the frontend shows a unified view.

---

## Data Model Changes (Convex Schema)

1) New table: `ayrsharePostedVideos`
- Shape and indexes mirror `manuallyPostedVideos`:
  - `campaignId: Id<'campaigns'>`
  - `userId: Id<'users'>`
  - `socialPlatform: 'tiktok' | 'instagram' | 'youtube'`
  - `videoId: string` (platform post ID from Ayrshare analytics, e.g., TikTok `id`)
  - `postedAt: number` (seconds epoch from Ayrshare `analytics.created`, per requirement)
  - `videoUrl: string` (Ayrshare `postUrl`)
  - `mediaUrl?: string` (unset for now)
  - `thumbnailUrl: string`
  - `views: number` (Ayrshare `videoViews`)
  - `likes: number` (Ayrshare `likeCount`)
  - `comments: number` (Ayrshare `commentsCount`)
  - `shares: number` (Ayrshare `shareCount`)
  - `saves: number` (Ayrshare `favorites`)
  - `updatedAt: number` (ms epoch at write time)
- Indexes:
  - `by_campaignId (campaignId)`
  - `by_userId (userId)`
  - `by_videoId_socialPlatform (videoId, socialPlatform)`

2) Update `reports.hiddenVideoIds` union to also include `Id<'ayrsharePostedVideos'>` so API-posted videos can be hidden in reports just like manual ones.

---

## Ayrshare Analytics Fetch – Backend Flow

### Source of truth for scheduled posts
- We already store scheduled posts in `generatedVideos` with per-platform sections:
  - `tiktokUpload`, `instagramUpload`, `youtubeUpload` each contain:
    - `socialAccountId: Id<'socialAccounts'>`
    - `post: { id: string; refId?: string; caption: string; url?: string; templateId?: string }`
    - `status: { isPosted: boolean; isFailed: boolean; failedReason?: string }`
- From `socialAccountId` → `socialAccounts.ayrshareProfileId` → `ayrshareProfiles.profileKey` to obtain Ayrshare `Profile-Key` header.

### New internal action: monitorApiPostedVideos
Add an internal action (module: `app/ayrshare.ts`) to:
1. Find all `generatedVideos` that have at least one platform with `post.id` status->isPosted=true
2. For each platform present (tiktok/instagram/youtube):
   - Resolve `profileKey` via the platform's `socialAccountId` → profile.
   - Call Ayrshare analytics:
     - URL: `https://api.ayrshare.com/api/analytics/post`
     - Method: `POST`
     - Headers:
       - `Authorization: Bearer ${AYRSHARE_API_KEY}`
       - `Content-Type: application/x-www-form-urlencoded`
       - `Profile-Key: <profileKey>`
     - Body:
       - `{ id: <post.id>, platforms: ["tiktok" | "instagram" | "youtube"] }`
3. Map Ayrshare response fields (per platform) to our schema:
   - `views` ← `analytics.videoViews ?? 0`
   - `likes` ← `analytics.likeCount ?? 0`
   - `comments` ← `analytics.commentsCount ?? 0`
   - `shares` ← `analytics.shareCount ?? 0`
   - `saves` ← `analytics.favorites ?? 0`
   - `videoId` ← `<platformResponse>.id` (e.g., TikTok `id`)
   - `postedAt` ← `Math.floor(new Date(analytics.created).getTime() / 1000)`
   - `videoUrl` ← `<platformResponse>.postUrl`
   - `thumbnailUrl` ← `analytics.thumbnailUrl`
   - `mediaUrl` ← `undefined` (unset)
4. Upsert in `ayrsharePostedVideos` by composite key `(campaignId, socialPlatform, videoId)`:
   - If exists (via `by_videoId_socialPlatform` and `campaignId` filter), `patch` metrics and `updatedAt`.
   - Else `insert` with full record including `userId` from the campaign.

### Helper mutation: storeAyrsharePostedVideo
- Add an internal mutation mirroring `storeManuallyPostedVideo`, but targeting `ayrsharePostedVideos` and enforcing the upsert rule above.

### Idempotency and performance
- Concurrency limit: process N videos in parallel (e.g., 5) per cron tick.
- Platform-level processing: per video, only call analytics for platforms present.
- Backoff on 429/5xx with jitter; skip and retry next cron for persistent failures.
- Avoid redundant writes: only patch if any metric changed or `updatedAt` is older than a threshold (optional optimization).

---

## Cron Setup
- Add a new cron in `convex/crons.ts`:
  - Name: `monitorApiPostedVideos`
  - Frequency: every 5 minutes (same cadence as manual monitoring)
  - Target: `internal.app.ayrshare.monitorApiPostedVideos`
- Ensure the action handles no-op quickly when there are no eligible posts.

---

## Analytics Aggregation Changes

1) Daily Campaign Snapshots (`aggregateCampaignPerformance` in `app/analytics.ts`)
- Currently aggregates only `manuallyPostedVideos` for each campaign.
- Update to fetch and sum metrics from BOTH `manuallyPostedVideos` and `ayrsharePostedVideos`:
  - `posts = manual.length + api.length`
  - `views/likes/comments/shares/saves` = sum across both sets.

2) Unified Fetch for Frontend (`fetchAnalyticsFromConvex` in `app/analytics.ts`)
- Today we fetch `manuallyPostedVideos` via `getManuallyPostedVideos`.
- Add `getAyrsharePostedVideos` internal query and fetch both by campaign IDs.
- Merge arrays, filter hidden IDs (extend `hiddenVideoIds` type to include `Id<'ayrsharePostedVideos'>`).
- Keep response shape the same; only the source expands.
- Important: Consistent time unit for `postedAt` in UI
  - Manual videos likely use ms; new API videos use seconds as required.
  - Before returning to UI, normalize `postedAt` for API videos to ms: `postedAtMs = postedAtSeconds * 1000`.
  - This avoids breaking any date formatting logic on the frontend.

3) Reports Hidden Videos
- Update `reports.hiddenVideoIds` union and related logic so hidden IDs can include `ayrsharePostedVideos`.

---

## Frontend Integration
- No route or component changes required if we continue consuming `api.app.analytics.fetchAnalytics`.
- The unified analytics response will now include API-posted videos.
- Types: If we have strict TypeScript types for the analytics response in `src/features/**/types`, confirm they accommodate the merged set (no `any`).
- Visuals and filtering continue to work unchanged.

---

## Error Handling & Edge Cases
- Missing `profileKey`: skip video and log a warning; will retry next cron.
- Missing `post.id`: skip platform.
- Ayrshare returns non-success or incomplete analytics: treat metrics as zeros, keep `updatedAt` and retry later.
- `analytics.created` absent: fallback `postedAt` to `generatedVideos.<platform>Upload.scheduledAt` if available; else `Date.now()/1000`.
- `postUrl` missing: fallback to `generatedVideos.<platform>Upload.post.url`.
- Ensure we never throw for a single video; collect errors per item and continue.

---

## Security & Config
- Uses existing `AYRSHARE_API_KEY` from environment; never log the secret.
- Use `Profile-Key` from our DB (per social account → profile).
- Keep logs informative but scrub PII and secrets.

---

## Step-by-Step Implementation Checklist

1) Schema
- Add `ayrsharePostedVideos` table with the same fields and indexes as `manuallyPostedVideos`.
- Extend `reports.hiddenVideoIds` union to include `Id<'ayrsharePostedVideos'>`.

2) Backend modules
- In `convex/app/ayrshare.ts`:
  - Add `internalAction monitorApiPostedVideos`.
  - Add `internalMutation storeAyrsharePostedVideo` (upsert).
  - Add small helpers to resolve `profileKey` from `socialAccountId`.
- In `convex/app/analytics.ts`:
  - Update `aggregateCampaignPerformance` to include `ayrsharePostedVideos`.
  - Add `internalQuery getAyrsharePostedVideos`.
  - Update `internalAction fetchAnalyticsFromConvex` to fetch, merge (manual + api), filter hidden, and normalize `postedAt` (api → ms).

3) Cron
- In `convex/crons.ts`, add:
  - `crons.interval("monitorApiPostedVideos", { minutes: 5 }, internal.app.ayrshare.monitorApiPostedVideos)`

4) Types & Frontend
- Verify analytics TypeScript types in `src/features/**/types` can represent merged videos.
- No UI code changes expected if backend response remains consistent.

5) QA & Rollout
- Seed a scheduled post via Ayrshare in a staging profile; let webhook populate `generatedVideos`’ post IDs.
- Manually trigger the new cron function once (via console) to backfill API analytics.
- Verify `ayrsharePostedVideos` rows are created/updated with correct mappings.
- Open analytics UI and confirm API-posted videos appear with correct metrics, date, and thumbnails.
- Validate snapshots include both sets; compare totals.

---

## Acceptance Criteria
- New table `ayrsharePostedVideos` exists with correct indexes.
- Cron creates/updates rows for all posted platforms with mapped metrics.
- Frontend analytics show both manual and API-posted videos in a single, consistent view.
- Daily snapshots aggregate both sources.
- Hidden videos in reports support IDs from the new table.
- No `any` types introduced; TypeScript strict passes; ESLint passes.

---

## Timeline (Estimate)
- Schema + cron + storage mutations: 0.5 day
- Aggregation and fetch updates: 0.5 day
- QA, fixes, and verification: 0.5 day
- Total: ~1.5 days

---

## Notes
- Unit discrepancy: Requirement asks `postedAt` in seconds for API videos; legacy manual entries are likely ms. We will store seconds in DB for `ayrsharePostedVideos` (per requirement) but normalize to ms in the unified analytics response to keep the UI consistent.
- If later we want perfect consistency at rest, we can migrate manual entries or API entries to a common unit, but that is not required for this task.
