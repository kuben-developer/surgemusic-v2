# Montager API Documentation

This document describes the external API endpoints for the Montager video montage generation system.

## Base URL

```
https://compassionate-flamingo-972.convex.site
```

## Authentication

These endpoints are currently unauthenticated. Ensure they are only accessible by trusted external systems.

---

## Endpoints

### 1. GET /api/montager/pending

Fetches all pending montage configurations with randomly selected clips. **Each call returns a fresh random selection of clips**, so the response will vary between calls for the same config.

#### Request

```bash
curl -X GET "https://compassionate-flamingo-972.convex.site/api/montager/pending"
```

#### Response

**Success (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "configId": "j572abc123def456",
      "montagerFolderId": "j573xyz789ghi012",
      "folderName": "my-montages",
      "clipperFolderIds": ["j574aaa111bbb222", "j574ccc333ddd444"],
      "numberOfMontages": 3,
      "totalClipsAvailable": 150,
      "montages": [
        {
          "clips": [
            "https://s3.example.com/clips/clip1.mp4",
            "https://s3.example.com/clips/clip2.mp4",
            "https://s3.example.com/clips/clip3.mp4",
            "https://s3.example.com/clips/clip4.mp4",
            "https://s3.example.com/clips/clip5.mp4",
            "https://s3.example.com/clips/clip6.mp4",
            "https://s3.example.com/clips/clip7.mp4",
            "https://s3.example.com/clips/clip8.mp4",
            "https://s3.example.com/clips/clip9.mp4",
            "https://s3.example.com/clips/clip10.mp4",
            "https://s3.example.com/clips/clip11.mp4",
            "https://s3.example.com/clips/clip12.mp4",
            "https://s3.example.com/clips/clip13.mp4",
            "https://s3.example.com/clips/clip14.mp4"
          ]
        },
        {
          "clips": ["...14 more randomly selected clips..."]
        },
        {
          "clips": ["...14 more randomly selected clips..."]
        }
      ]
    }
  ],
  "count": 1
}
```

**No pending configs (200 OK):**

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
| `configId` | string | Unique configuration ID (use this for updates) |
| `montagerFolderId` | string | ID of the target montager folder |
| `folderName` | string | Human-readable folder name |
| `clipperFolderIds` | string[] | IDs of source clipper folders |
| `numberOfMontages` | number | Number of montages requested |
| `totalClipsAvailable` | number | Total clips available from source folders |
| `montages` | array | Array of montage objects with clip URLs |
| `montages[].clips` | string[] | Array of 14 randomly selected clip URLs |

#### Random Selection Behavior

- **14 clips per montage**: Each montage gets exactly 14 randomly selected clips
- **Reuse allowed**: The same clip can appear in multiple montages
- **Deleted clips excluded**: Clips marked as `isDeleted: true` are not included
- **Fresh random on each call**: Calling this endpoint multiple times will return different random selections

---

### 2. POST /api/montager/update

Updates montager with generated video URLs. Adds videos to the database and marks the configuration as processed.

#### Request

```bash
curl -X POST "https://compassionate-flamingo-972.convex.site/api/montager/update" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "configId": "j572abc123def456",
        "videos": [
          {
            "videoUrl": "https://s3.example.com/montages/montage_001.mp4",
            "thumbnailUrl": "https://s3.example.com/montages/montage_001_thumb.jpg"
          },
          {
            "videoUrl": "https://s3.example.com/montages/montage_002.mp4",
            "thumbnailUrl": "https://s3.example.com/montages/montage_002_thumb.jpg"
          },
          {
            "videoUrl": "https://s3.example.com/montages/montage_003.mp4",
            "thumbnailUrl": "https://s3.example.com/montages/montage_003_thumb.jpg"
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
      "configId": "string (required) - The configId from GET /api/montager/pending",
      "videos": [
        {
          "videoUrl": "string (required) - URL to the generated montage video",
          "thumbnailUrl": "string (required) - URL to the montage thumbnail image"
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
  "updated": 1,
  "failed": 0,
  "results": [
    {
      "configId": "j572abc123def456",
      "videosAdded": 3,
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
      "configId": "j572abc123def456",
      "videosAdded": 3,
      "success": true
    },
    {
      "configId": "invalid_id",
      "success": false,
      "error": "Config not found: invalid_id"
    }
  ]
}
```

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Each video must have: videoUrl (string), thumbnailUrl (string)"
}
```

---

## Complete Integration Example

### Python Example

```python
import requests
import json

BASE_URL = "https://your-deployment.convex.site"

def get_pending_configs():
    """Fetch all pending montage configurations with random clips."""
    response = requests.get(f"{BASE_URL}/api/montager/pending")
    return response.json()

def update_montager(config_id: str, videos: list):
    """Update montager with generated videos."""
    payload = {
        "updates": [
            {
                "configId": config_id,
                "videos": videos
            }
        ]
    }
    response = requests.post(
        f"{BASE_URL}/api/montager/update",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    return response.json()

# Example usage
def process_montages():
    # 1. Get pending configs with random clips
    pending = get_pending_configs()

    if not pending["success"]:
        print(f"Error fetching pending configs: {pending.get('error')}")
        return

    print(f"Found {pending['count']} pending configurations")

    for config in pending["data"]:
        config_id = config["configId"]
        folder_name = config["folderName"]

        print(f"Processing config for folder: {folder_name}")
        print(f"  - {config['numberOfMontages']} montages requested")
        print(f"  - {config['totalClipsAvailable']} clips available")

        # 2. Process each montage
        generated_videos = []

        for i, montage in enumerate(config["montages"]):
            clips = montage["clips"]
            print(f"  Creating montage {i + 1} with {len(clips)} clips")

            # 3. Generate the montage video (your video processing logic)
            video_result = create_montage_video(clips, f"{folder_name}_montage_{i+1}")

            generated_videos.append({
                "videoUrl": video_result["video_url"],
                "thumbnailUrl": video_result["thumbnail_url"]
            })

        # 4. Update the config with generated videos
        result = update_montager(config_id, generated_videos)

        if result["success"]:
            print(f"  ✓ Successfully added {len(generated_videos)} videos")
        else:
            print(f"  ✗ Failed: {result.get('error')}")

def create_montage_video(clips: list, name: str) -> dict:
    """
    Replace this with your actual video processing logic.
    Should concatenate clips into a single montage video.
    """
    # Your video processing code here
    # Example return:
    return {
        "video_url": f"https://s3.example.com/montages/{name}.mp4",
        "thumbnail_url": f"https://s3.example.com/montages/{name}_thumb.jpg"
    }

if __name__ == "__main__":
    process_montages()
```

### Node.js Example

```javascript
const BASE_URL = "https://your-deployment.convex.site";

async function getPendingConfigs() {
  const response = await fetch(`${BASE_URL}/api/montager/pending`);
  return response.json();
}

async function updateMontager(configId, videos) {
  const response = await fetch(`${BASE_URL}/api/montager/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      updates: [{ configId, videos }]
    })
  });
  return response.json();
}

// Example usage
async function processMontages() {
  // 1. Get pending configs
  const pending = await getPendingConfigs();

  if (!pending.success) {
    console.error(`Error: ${pending.error}`);
    return;
  }

  console.log(`Found ${pending.count} pending configurations`);

  for (const config of pending.data) {
    console.log(`Processing: ${config.folderName}`);

    // 2. Process each montage
    const generatedVideos = [];

    for (let i = 0; i < config.montages.length; i++) {
      const montage = config.montages[i];
      console.log(`  Creating montage ${i + 1} with ${montage.clips.length} clips`);

      // 3. Generate the montage (your logic here)
      const result = await createMontageVideo(montage.clips, `${config.folderName}_${i + 1}`);
      generatedVideos.push(result);
    }

    // 4. Update
    const result = await updateMontager(config.configId, generatedVideos);

    if (result.success) {
      console.log(`  ✓ Added ${generatedVideos.length} videos`);
    } else {
      console.log(`  ✗ Failed: ${result.error}`);
    }
  }
}

async function createMontageVideo(clips, name) {
  // Your video processing logic here
  return {
    videoUrl: `https://s3.example.com/montages/${name}.mp4`,
    thumbnailUrl: `https://s3.example.com/montages/${name}_thumb.jpg`
  };
}

processMontages();
```

### cURL Example

```bash
# Get pending configs with random clips
curl -X GET "https://your-deployment.convex.site/api/montager/pending"

# Update with generated videos
curl -X POST "https://your-deployment.convex.site/api/montager/update" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {
        "configId": "j572abc123def456",
        "videos": [
          {
            "videoUrl": "https://cdn.example.com/montages/montage_001.mp4",
            "thumbnailUrl": "https://cdn.example.com/montages/montage_001_thumb.jpg"
          },
          {
            "videoUrl": "https://cdn.example.com/montages/montage_002.mp4",
            "thumbnailUrl": "https://cdn.example.com/montages/montage_002_thumb.jpg"
          }
        ]
      }
    ]
  }'
```

---

## Data Flow

```
1. User creates montage config in UI
   └── Selects clipper folders and number of montages
   └── Config saved to montageConfigs table with isProcessed=false

2. External system polls GET /api/montager/pending
   └── Receives configs with randomly selected clips (14 per montage)
   └── Random selection happens fresh on each call

3. External system processes clips
   └── Downloads clip videos
   └── Concatenates into montage videos
   └── Uploads montage videos and thumbnails

4. External system calls POST /api/montager/update
   └── Videos added to montagerVideos table
   └── Config marked as isProcessed=true

5. User sees completed montages in UI
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

1. **Process one config at a time**: To avoid race conditions, process configs sequentially.

2. **Idempotency**: Once a config is processed, it won't appear in future pending calls. Ensure your processing pipeline handles failures gracefully.

3. **Clip download caching**: Since clips may be reused across montages, consider caching downloaded clips locally.

4. **Parallel montage creation**: Within a single config, you can create multiple montages in parallel since they're independent.

5. **Error handling**: If montage creation fails, the config remains unprocessed. Implement retry logic for transient failures.

6. **Polling frequency**: Poll the pending endpoint at reasonable intervals (e.g., every 30 seconds to 1 minute) to avoid unnecessary load.
