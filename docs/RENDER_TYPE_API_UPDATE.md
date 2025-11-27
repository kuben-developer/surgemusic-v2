# Render Type API Update

This document describes the new `renderType` field added to the Montager Videos Processing API. This update allows users to specify what content should be rendered on the processed video.
---

## Overview

The `renderType` field controls what text content is rendered on the processed video:

| Render Type | Value | Description |
|-------------|-------|-------------|
| **Both** | `"Both"` | Render both lyrics (from SRT) AND captions on the video |
| **Lyrics Only** | `"LyricsOnly"` | Render ONLY the lyrics from the SRT file, ignore captions |
| **Caption Only** | `"CaptionOnly"` | Render ONLY the captions, ignore lyrics from SRT |

---

## API Changes

### GET /api/montager-videos/pending

The response now includes a `renderType` field for each video.

#### Updated Response Schema

```json
{
  "success": true,
  "data": [
    {
      "videoId": "j572abc123def456",
      "videoUrl": "https://s3.example.com/montages/video_001.mp4",
      "thumbnailUrl": "https://s3.example.com/montages/video_001_thumb.jpg",
      "overlayStyle": "Blend",
      "renderType": "Both",          // <-- NEW FIELD
      "airtableRecordId": "recXYZ789",
      "campaignId": "campaign_abc123",
      "audioUrl": "https://storage.example.com/audio/song.mp3",
      "srtUrl": "https://storage.example.com/srt/lyrics.srt",
      "captions": [
        "Check out this amazing track! 🎵",
        "New music dropping soon 🔥"
      ]
    }
  ],
  "count": 1
}
```

#### Updated Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `videoId` | string | Unique video ID (use this for updates) |
| `videoUrl` | string | URL to the original montage video |
| `thumbnailUrl` | string | URL to the video thumbnail |
| `overlayStyle` | string | The visual overlay style (e.g., "Blend", "Brat", "Tiktok", "Pink") |
| **`renderType`** | string | **NEW** - What content to render: `"Both"`, `"LyricsOnly"`, or `"CaptionOnly"` |
| `airtableRecordId` | string | The Airtable record ID this video is assigned to |
| `campaignId` | string | The campaign ID for fetching related assets |
| `audioUrl` | string? | URL to the campaign audio file |
| `srtUrl` | string? | URL to the SRT subtitle file (lyrics) |
| `captions` | string[] | Array of caption texts for the campaign |

---

## Processing Logic

The external processor should handle each `renderType` as follows:

### 1. `renderType: "Both"` (Default)

Render **both** lyrics and captions on the video.

```
Input:
  - srtUrl: "https://example.com/lyrics.srt"  ← USE THIS
  - captions: ["Caption 1", "Caption 2"]       ← USE THIS

Output:
  - Video with BOTH lyrics from SRT AND caption text overlays
```

**Processing steps:**
1. Parse the SRT file from `srtUrl` to extract timed lyrics
2. Use the `captions` array for text overlays
3. Apply both to the video according to the `overlayStyle`

### 2. `renderType: "LyricsOnly"`

Render **only** the lyrics from the SRT file. **Ignore captions completely.**

```
Input:
  - srtUrl: "https://example.com/lyrics.srt"  ← USE THIS
  - captions: ["Caption 1", "Caption 2"]       ← IGNORE THIS

Output:
  - Video with ONLY lyrics from SRT, no caption overlays
```

**Processing steps:**
1. Parse the SRT file from `srtUrl` to extract timed lyrics
2. **Do NOT** use the `captions` array
3. Apply only the lyrics to the video according to the `overlayStyle`

### 3. `renderType: "CaptionOnly"`

Render **only** the captions. **Ignore the SRT/lyrics completely.**

```
Input:
  - srtUrl: "https://example.com/lyrics.srt"  ← IGNORE THIS
  - captions: ["Caption 1", "Caption 2"]       ← USE THIS

Output:
  - Video with ONLY caption text overlays, no lyrics
```

**Processing steps:**
1. **Do NOT** parse or use the SRT file
2. Use only the `captions` array for text overlays
3. Apply captions to the video according to the `overlayStyle`

---

## Decision Matrix

| renderType | Use `srtUrl` (Lyrics) | Use `captions` |
|------------|----------------------|----------------|
| `"Both"` | ✅ Yes | ✅ Yes |
| `"LyricsOnly"` | ✅ Yes | ❌ No |
| `"CaptionOnly"` | ❌ No | ✅ Yes |