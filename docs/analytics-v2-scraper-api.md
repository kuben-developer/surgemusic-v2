# Analytics V2 - External Scraper API

Base URL: `https://api.surgemusic.io`

## Workflow

1. **Discover** videos to scrape via `GET /api/analytics/campaign-videos`
2. **Scrape** TikTok stats externally (using Tokapi, TikTok API, etc.)
3. **Push** updated stats via `POST /api/analytics/videos`

---

## GET /api/analytics/campaign-videos

Returns all tracked videos for a campaign, grouped by TikTok author ID.

### Request

```
GET /api/analytics/campaign-videos?campaignId=<CAMPAIGN_ID>
```

| Parameter    | Type   | Required | Description               |
|-------------|--------|----------|---------------------------|
| `campaignId` | string | Yes      | Airtable campaign ID      |

### Response

```json
{
  "success": true,
  "data": {
    "6789012345": ["7301234567890", "7301234567891"],
    "1234567890": ["7309876543210"]
  }
}
```

`data` is a map of `tiktokAuthorId` to an array of `tiktokVideoId` strings.

### Errors

| Status | Body |
|--------|------|
| 400    | `{ "success": false, "error": "Missing campaignId parameter" }` |
| 500    | `{ "success": false, "error": "<message>" }` |

---

## POST /api/analytics/videos

Push updated stats for one or more TikTok videos. Only updates videos that already exist in the database (discovered via the populate cron). Videos not found are skipped and counted in `notFound`.

### Request

```
POST /api/analytics/videos
Content-Type: application/json
```

```json
{
  "videos": [
    {
      "tiktokVideoId": "7301234567890",
      "views": 150000,
      "likes": 12000,
      "comments": 340,
      "shares": 890,
      "saves": 2100
    },
    {
      "tiktokVideoId": "7301234567891",
      "views": 45000,
      "likes": 3200,
      "comments": 98,
      "shares": 210,
      "saves": 450
    }
  ]
}
```

| Field           | Type   | Required | Description                    |
|----------------|--------|----------|--------------------------------|
| `tiktokVideoId` | string | Yes      | TikTok video ID                |
| `views`          | number | Yes      | Current view count             |
| `likes`          | number | Yes      | Current like count             |
| `comments`       | number | Yes      | Current comment count          |
| `shares`         | number | Yes      | Current share count            |
| `saves`          | number | Yes      | Current save/bookmark count    |

### Response

Returns immediately after scheduling — processing happens asynchronously.

```json
{
  "success": true,
  "scheduled": 2
}
```

| Field       | Description                                      |
|------------|--------------------------------------------------|
| `scheduled` | Number of videos scheduled for processing        |

### Errors

| Status | Body |
|--------|------|
| 400    | `{ "success": false, "error": "Missing or empty videos array" }` |
| 500    | `{ "success": false, "error": "<message>" }` |

### Notes

- Each video is processed independently via Convex scheduler (fan-out pattern)
- Each update triggers aggregate recalculation (real-time KPI updates)
- Hourly video snapshots are created automatically for spark charts
- There is no authentication on these endpoints currently
- No limit on array size, but keep batches reasonable (< 1000 per request)
