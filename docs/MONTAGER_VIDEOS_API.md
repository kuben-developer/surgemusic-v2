# Montager Videos Processing API Documentation

This document describes the external API endpoints for processing montager videos with overlays. These endpoints are used after videos have been assigned to Airtable records and need overlay/text processing applied.

## Base URL

```
https://compassionate-flamingo-972.convex.site
```

## Authentication

These endpoints are currently unauthenticated. Ensure they are only accessible by trusted external systems.

---

## Workflow Overview

```
1. User assigns montager videos to Airtable records in the UI
   └── Videos get status "ready_for_processing" with overlayStyle set

2. External system polls GET /api/montager-videos/pending
   └── Receives videos that need overlay processing
   └── Each video includes: videoUrl, overlayStyle, airtableRecordId

3. External system processes videos
   └── Downloads the original video
   └── Applies the specified overlay style (text, captions, etc.)
   └── Uploads the processed video

4. External system calls POST /api/montager-videos/update
   └── Video's processedVideoUrl is set
   └── Status changes from "ready_for_processing" to "processed"

5. User sees processed videos in the "Ready to Publish" section
   └── Can publish to Airtable when ready
```

---

## Endpoints

### 1. GET /api/montager-videos/pending

Fetches all montager videos that are ready for overlay processing. These are videos that have been assigned to Airtable records and need text/overlay processing applied.

#### Request

```bash
curl -X GET "https://compassionate-flamingo-972.convex.site/api/montager-videos/pending"
```

#### Response

**Success (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "videoId": "j572abc123def456",
      "videoUrl": "https://s3.example.com/montages/video_001.mp4",
      "thumbnailUrl": "https://s3.example.com/montages/video_001_thumb.jpg",
      "overlayStyle": "Style A",
      "airtableRecordId": "recXYZ789",
      "campaignId": "campaign_abc123",
      "audioUrl": "https://storage.example.com/audio/song.mp3",
      "srtUrl": "https://storage.example.com/srt/lyrics.srt",
      "captions": [
        "Check out this amazing track! 🎵",
        "New music dropping soon 🔥"
      ]
    },
    {
      "videoId": "j572ghi789jkl012",
      "videoUrl": "https://s3.example.com/montages/video_002.mp4",
      "thumbnailUrl": "https://s3.example.com/montages/video_002_thumb.jpg",
      "overlayStyle": "Style B",
      "airtableRecordId": "recABC456",
      "campaignId": "campaign_abc123",
      "audioUrl": "https://storage.example.com/audio/song.mp3",
      "srtUrl": "https://storage.example.com/srt/lyrics.srt",
      "captions": [
        "Check out this amazing track! 🎵",
        "New music dropping soon 🔥"
      ]
    }
  ],
  "count": 2
}
```

**No pending videos (200 OK):**

```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

**Error (500 Internal Server Error):**

```json
{
  "success": false,
  "error": "Error message here"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `videoId` | string | Unique video ID (use this for updates) |
| `videoUrl` | string | URL to the original montage video |
| `thumbnailUrl` | string | URL to the video thumbnail |
| `overlayStyle` | string | The overlay style to apply (e.g., "Style A", "Style B") |
| `airtableRecordId` | string | The Airtable record ID this video is assigned to |
| `campaignId` | string | The campaign ID for fetching related assets |
| `audioUrl` | string? | URL to the campaign audio file (for audio overlay) |
| `srtUrl` | string? | URL to the SRT subtitle file (for lyric overlays) |
| `captions` | string[] | Array of caption texts for the campaign |

---

### 2. POST /api/montager-videos/update

Updates montager videos with processed video URLs. Sets the `processedVideoUrl` field and changes the status to "processed".

#### Request

```bash
curl -X POST "https://compassionate-flamingo-972.convex.site/api/montager-videos/update" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "videoId": "j572abc123def456",
        "processedVideoUrl": "https://s3.example.com/processed/video_001_overlay.mp4"
      },
      {
        "videoId": "j572ghi789jkl012",
        "processedVideoUrl": "https://s3.example.com/processed/video_002_overlay.mp4"
      }
    ]
  }'
```

#### Request Body

```json
{
  "updates": [
    {
      "videoId": "string (required) - The videoId from GET /api/montager-videos/pending",
      "processedVideoUrl": "string (required) - URL to the processed video with overlay"
    }
  ]
}
```

#### Response

**Full Success (200 OK):**

```json
{
  "success": true,
  "updated": 2,
  "failed": 0,
  "results": [
    {
      "videoId": "j572abc123def456",
      "success": true
    },
    {
      "videoId": "j572ghi789jkl012",
      "success": true
    }
  ]
}
```

**Partial Success (207 Multi-Status):**

```json
{
  "success": false,
  "updated": 1,
  "failed": 1,
  "results": [
    {
      "videoId": "j572abc123def456",
      "success": true
    },
    {
      "videoId": "invalid_id",
      "success": false,
      "error": "Video not found: invalid_id"
    }
  ]
}
```

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Each update must have videoId and processedVideoUrl"
}
```

---

## Complete Integration Example

### Python Example

```python
import requests
import json

BASE_URL = "https://compassionate-flamingo-972.convex.site"

def get_pending_videos():
    """Fetch all videos ready for overlay processing."""
    response = requests.get(f"{BASE_URL}/api/montager-videos/pending")
    return response.json()

def update_processed_video(video_id: str, processed_url: str):
    """Update a single video with its processed URL."""
    payload = {
        "updates": [
            {
                "videoId": video_id,
                "processedVideoUrl": processed_url
            }
        ]
    }
    response = requests.post(
        f"{BASE_URL}/api/montager-videos/update",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    return response.json()

def batch_update_videos(updates: list):
    """Update multiple videos at once."""
    payload = {"updates": updates}
    response = requests.post(
        f"{BASE_URL}/api/montager-videos/update",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    return response.json()

# Example usage
def process_videos():
    # 1. Get pending videos
    pending = get_pending_videos()

    if not pending["success"]:
        print(f"Error fetching pending videos: {pending.get('error')}")
        return

    print(f"Found {pending['count']} videos to process")

    if pending["count"] == 0:
        print("No videos to process")
        return

    # 2. Process each video
    processed_updates = []

    for video in pending["data"]:
        video_id = video["videoId"]
        video_url = video["videoUrl"]
        overlay_style = video["overlayStyle"]
        airtable_id = video["airtableRecordId"]
        audio_url = video.get("audioUrl")
        srt_url = video.get("srtUrl")
        captions = video.get("captions", [])

        print(f"Processing video {video_id}")
        print(f"  - Original URL: {video_url}")
        print(f"  - Overlay style: {overlay_style}")
        print(f"  - Airtable ID: {airtable_id}")
        print(f"  - Audio URL: {audio_url}")
        print(f"  - SRT URL: {srt_url}")
        print(f"  - Captions: {len(captions)} available")

        # 3. Apply overlay processing (your video processing logic)
        # Use audio_url and srt_url for audio/lyric overlays
        processed_url = apply_overlay(video_url, overlay_style, audio_url, srt_url)

        processed_updates.append({
            "videoId": video_id,
            "processedVideoUrl": processed_url
        })

    # 4. Batch update all processed videos
    if processed_updates:
        result = batch_update_videos(processed_updates)

        if result["success"]:
            print(f"✓ Successfully processed {result['updated']} videos")
        else:
            print(f"✗ Processed {result['updated']}, failed {result['failed']}")
            for r in result["results"]:
                if not r["success"]:
                    print(f"  - Failed: {r['videoId']} - {r.get('error')}")

def apply_overlay(video_url: str, overlay_style: str, audio_url: str = None, srt_url: str = None) -> str:
    """
    Replace this with your actual overlay processing logic.
    Should download the video, apply text/overlay, and upload the result.

    Args:
        video_url: URL to the original montage video
        overlay_style: The overlay style to apply
        audio_url: Optional URL to audio file for audio overlay
        srt_url: Optional URL to SRT file for lyric/caption overlay
    """
    # Your video processing code here
    # Example: Download video, apply overlay using audio_url/srt_url, upload result
    return f"https://s3.example.com/processed/{overlay_style.lower().replace(' ', '_')}_output.mp4"

if __name__ == "__main__":
    process_videos()
```

### Node.js Example

```javascript
const BASE_URL = "https://compassionate-flamingo-972.convex.site";

async function getPendingVideos() {
  const response = await fetch(`${BASE_URL}/api/montager-videos/pending`);
  return response.json();
}

async function updateProcessedVideos(updates) {
  const response = await fetch(`${BASE_URL}/api/montager-videos/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates })
  });
  return response.json();
}

// Example usage
async function processVideos() {
  // 1. Get pending videos
  const pending = await getPendingVideos();

  if (!pending.success) {
    console.error(`Error: ${pending.error}`);
    return;
  }

  console.log(`Found ${pending.count} videos to process`);

  if (pending.count === 0) {
    console.log("No videos to process");
    return;
  }

  // 2. Process each video
  const processedUpdates = [];

  for (const video of pending.data) {
    console.log(`Processing: ${video.videoId}`);
    console.log(`  - Overlay style: ${video.overlayStyle}`);
    console.log(`  - Audio URL: ${video.audioUrl || "none"}`);
    console.log(`  - SRT URL: ${video.srtUrl || "none"}`);
    console.log(`  - Captions: ${video.captions?.length || 0} available`);

    // 3. Apply overlay (your logic here)
    // Use video.audioUrl and video.srtUrl for audio/lyric overlays
    const processedUrl = await applyOverlay(
      video.videoUrl,
      video.overlayStyle,
      video.audioUrl,
      video.srtUrl
    );

    processedUpdates.push({
      videoId: video.videoId,
      processedVideoUrl: processedUrl
    });
  }

  // 4. Batch update
  const result = await updateProcessedVideos(processedUpdates);

  if (result.success) {
    console.log(`✓ Processed ${result.updated} videos`);
  } else {
    console.log(`✗ Processed ${result.updated}, failed ${result.failed}`);
  }
}

async function applyOverlay(videoUrl, overlayStyle, audioUrl, srtUrl) {
  // Your video processing logic here
  // Use audioUrl and srtUrl for audio/lyric overlays
  return `https://s3.example.com/processed/${overlayStyle.toLowerCase().replace(/ /g, "_")}_output.mp4`;
}

processVideos();
```

### cURL Example

```bash
# Get pending videos for processing
curl -X GET "https://compassionate-flamingo-972.convex.site/api/montager-videos/pending"

# Update videos with processed URLs
curl -X POST "https://compassionate-flamingo-972.convex.site/api/montager-videos/update" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "videoId": "j572abc123def456",
        "processedVideoUrl": "https://cdn.example.com/processed/video_001_overlay.mp4"
      },
      {
        "videoId": "j572ghi789jkl012",
        "processedVideoUrl": "https://cdn.example.com/processed/video_002_overlay.mp4"
      }
    ]
  }'
```

---

## Video Status Flow

```
pending
  │
  │ (User assigns to Airtable record with overlay style)
  ▼
ready_for_processing  ← GET /api/montager-videos/pending returns these
  │
  │ (External system processes and calls POST /api/montager-videos/update)
  ▼
processed             ← Videos shown in "Ready to Publish" section
  │
  │ (User publishes to Airtable)
  ▼
published
```

---

## Error Handling

| Status Code | Meaning |
|-------------|---------|
| 200 | Success (all operations completed) |
| 207 | Partial success (some operations failed) |
| 400 | Bad request (invalid payload) |
| 500 | Server error |

Always check the `success` field in the response to determine if the operation completed successfully.

---

## Best Practices

1. **Poll at reasonable intervals**: Check for pending videos every 30-60 seconds to avoid unnecessary load.

2. **Batch updates when possible**: Update multiple videos in a single API call for efficiency.

3. **Handle partial failures**: When updating multiple videos, check individual results for failures.

4. **Idempotency**: Videos can only be updated once (must have status "ready_for_processing"). Subsequent updates will fail.

5. **Retry logic**: Implement retry logic for transient failures, but respect the status constraint.

6. **Cache overlay templates**: If you use the same overlay styles frequently, cache your overlay templates locally.

7. **Parallel processing**: Since videos are independent, you can process multiple videos in parallel.

---

## Overlay Styles

The `overlayStyle` field indicates what type of text/visual overlay should be applied to the video. Common styles might include:

- **Style A**: Basic caption overlay
- **Style B**: Lyrics with highlighting
- **Style C**: Bold centered text
- etc.

The specific styles and their implementations are defined by your processing system.
