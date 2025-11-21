# Clipper API Documentation

This document describes the external API endpoints for the Clipper video processing system.

## Base URL

```
https://compassionate-flamingo-972.convex.site
```

## Authentication

These endpoints are currently unauthenticated. Ensure they are only accessible by trusted external systems.

---

## Endpoints

### 1. GET /api/clipper/pending

Fetches all videos that are waiting to be processed (videos where `outputUrls` is empty).

#### Request

```bash
curl -X GET "https://compassionate-flamingo-972.convex.site/api/clipper/pending"
```

#### Response

**Success (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "j572abc123def456",
      "clipperFolderId": "j573xyz789ghi012",
      "folderName": "my-project",
      "inputVideoName": "my-video-name",
      "inputVideoUrl": "https://s3.example.com/bucket/videos/my-video.mp4"
    },
    {
      "_id": "j572xyz789abc123",
      "clipperFolderId": "j573xyz789ghi012",
      "folderName": "my-project",
      "inputVideoName": "another-video",
      "inputVideoUrl": "https://s3.example.com/bucket/videos/another-video.mp4"
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
| `_id` | string | Unique video ID (use this for updates) |
| `clipperFolderId` | string | ID of the folder containing this video |
| `folderName` | string | Human-readable folder name |
| `inputVideoName` | string | Sanitized video name (URL-safe) |
| `inputVideoUrl` | string | URL to the source video file |

---

### 2. POST /api/clipper/update

Updates video records with generated clip URLs and metadata.

#### Request

```bash
curl -X POST "https://compassionate-flamingo-972.convex.site/api/clipper/update" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      { 
        "videoId": "j572abc123def456",
        "outputUrls": [
          {
            "videoUrl": "https://s3.example.com/clips/clip_001.mp4",
            "thumbnailUrl": "https://s3.example.com/clips/clip_001_thumb.jpg",
            "clipNumber": 1,
            "brightness": 75,
            "clarity": 90
          },
          {
            "videoUrl": "https://s3.example.com/clips/clip_002.mp4",
            "thumbnailUrl": "https://s3.example.com/clips/clip_002_thumb.jpg",
            "clipNumber": 2,
            "brightness": 80,
            "clarity": 85
          }
        ]
      }
    ]
  }'
```

#### Request Body

```json
{
  "updates": [
    {
      "videoId": "string (required) - The _id from GET /api/clipper/pending",
      "outputUrls": [
        {
          "videoUrl": "string (required) - URL to the generated clip video",
          "thumbnailUrl": "string (required) - URL to the clip thumbnail image",
          "clipNumber": "number (required) - Sequential clip number (1, 2, 3...)",
          "brightness": "number (required) - Brightness score (0-100)",
          "clarity": "number (required) - Clarity/quality score (0-100)",
          "isDeleted": "boolean (optional) - Soft delete flag, defaults to false"
        }
      ]
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
      "clipCount": 5,
      "success": true
    },
    {
      "videoId": "j572xyz789abc123",
      "clipCount": 3,
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
      "clipCount": 5,
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
  "error": "Each outputUrl must have: videoUrl (string), thumbnailUrl (string), clipNumber (number), brightness (number), clarity (number)"
}
```

**Server Error (500 Internal Server Error):**

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Complete Integration Example

### Python Example

```python
import requests
import json

BASE_URL = "https://your-deployment.convex.site"

def get_pending_videos():
    """Fetch all videos waiting to be processed."""
    response = requests.get(f"{BASE_URL}/api/clipper/pending")
    return response.json()

def update_video_clips(video_id: str, clips: list):
    """Update a video with its generated clips."""
    payload = {
        "updates": [
            {
                "videoId": video_id,
                "outputUrls": clips
            }
        ]
    }
    response = requests.post(
        f"{BASE_URL}/api/clipper/update",
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

    print(f"Found {pending['count']} pending videos")

    for video in pending["data"]:
        video_id = video["_id"]
        input_url = video["inputVideoUrl"]

        print(f"Processing: {video['inputVideoName']}")

        # 2. Process the video (your video processing logic here)
        # This is where you'd call your video clipping service
        generated_clips = process_video_with_your_service(input_url)

        # 3. Format clips for the API
        clips = [
            {
                "videoUrl": clip["url"],
                "thumbnailUrl": clip["thumbnail"],
                "clipNumber": i + 1,
                "brightness": clip["brightness_score"],
                "clarity": clip["clarity_score"]
            }
            for i, clip in enumerate(generated_clips)
        ]

        # 4. Update the video with generated clips
        result = update_video_clips(video_id, clips)

        if result["success"]:
            print(f"  ✓ Updated with {len(clips)} clips")
        else:
            print(f"  ✗ Failed: {result.get('error')}")

def process_video_with_your_service(input_url: str) -> list:
    """
    Replace this with your actual video processing logic.
    Should return a list of generated clips with their metadata.
    """
    # Example return format
    return [
        {
            "url": "https://s3.example.com/clips/clip_001.mp4",
            "thumbnail": "https://s3.example.com/clips/clip_001_thumb.jpg",
            "brightness_score": 75,
            "clarity_score": 90
        },
        # ... more clips
    ]

if __name__ == "__main__":
    process_videos()
```

### Node.js Example

```javascript
const BASE_URL = "https://your-deployment.convex.site";

async function getPendingVideos() {
  const response = await fetch(`${BASE_URL}/api/clipper/pending`);
  return response.json();
}

async function updateVideoClips(videoId, clips) {
  const response = await fetch(`${BASE_URL}/api/clipper/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      updates: [{ videoId, outputUrls: clips }]
    })
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

  console.log(`Found ${pending.count} pending videos`);

  for (const video of pending.data) {
    console.log(`Processing: ${video.inputVideoName}`);

    // 2. Process video with your service
    const generatedClips = await processVideoWithYourService(video.inputVideoUrl);

    // 3. Format clips
    const clips = generatedClips.map((clip, index) => ({
      videoUrl: clip.url,
      thumbnailUrl: clip.thumbnail,
      clipNumber: index + 1,
      brightness: clip.brightnessScore,
      clarity: clip.clarityScore
    }));

    // 4. Update
    const result = await updateVideoClips(video._id, clips);

    if (result.success) {
      console.log(`  ✓ Updated with ${clips.length} clips`);
    } else {
      console.log(`  ✗ Failed: ${result.error}`);
    }
  }
}

processVideos();
```

### cURL Example (Batch Update)

```bash
# Get pending videos
curl -X GET "https://your-deployment.convex.site/api/clipper/pending"

# Update multiple videos at once
curl -X POST "https://your-deployment.convex.site/api/clipper/update" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "videoId": "j572abc123def456",
        "outputUrls": [
          {
            "videoUrl": "https://cdn.example.com/clips/video1_clip1.mp4",
            "thumbnailUrl": "https://cdn.example.com/clips/video1_clip1_thumb.jpg",
            "clipNumber": 1,
            "brightness": 72,
            "clarity": 88
          },
          {
            "videoUrl": "https://cdn.example.com/clips/video1_clip2.mp4",
            "thumbnailUrl": "https://cdn.example.com/clips/video1_clip2_thumb.jpg",
            "clipNumber": 2,
            "brightness": 65,
            "clarity": 92
          }
        ]
      },
      {
        "videoId": "j572xyz789abc123",
        "outputUrls": [
          {
            "videoUrl": "https://cdn.example.com/clips/video2_clip1.mp4",
            "thumbnailUrl": "https://cdn.example.com/clips/video2_clip1_thumb.jpg",
            "clipNumber": 1,
            "brightness": 80,
            "clarity": 95
          }
        ]
      }
    ]
  }'
```

---

## Data Model

### OutputUrl Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `videoUrl` | string | Yes | Direct URL to the clip video file |
| `thumbnailUrl` | string | Yes | Direct URL to the clip thumbnail image |
| `clipNumber` | number | Yes | Sequential number identifying the clip (1, 2, 3...) |
| `brightness` | number | Yes | Brightness score, typically 0-100 |
| `clarity` | number | Yes | Clarity/quality score, typically 0-100 |
| `isDeleted` | boolean | No | Soft delete flag (default: false) |

### Brightness & Clarity Scores

These scores are used for sorting clips in the UI:
- **Brightness**: A measure of the overall luminance of the clip. Higher values indicate brighter clips.
- **Clarity**: A measure of the visual quality/sharpness. Higher values indicate clearer clips.

Both scores should be in the range 0-100, but any numeric value is accepted.

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

1. **Batch Updates**: Send multiple video updates in a single request when possible to reduce API calls.

2. **Idempotency**: Updating the same video multiple times will overwrite previous `outputUrls`. Ensure your processing pipeline handles this correctly.

3. **Error Handling**: Always check the `results` array in the response to identify which specific updates failed.

4. **Polling**: The GET endpoint can be polled periodically to check for new videos to process. Consider implementing exponential backoff if no videos are pending.

5. **Clip Ordering**: Use `clipNumber` to maintain the correct order of clips. The UI will sort by this field.
