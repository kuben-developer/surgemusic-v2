"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// ============================================================
// AI CLIP GENERATION ACTION (Node.js runtime)
// ============================================================

export const generateClips = internalAction({
  args: {
    folderId: v.string(),
    videoId: v.string(),
    transcriptId: v.string(),
    minClipDuration: v.number(),
    maxClipDuration: v.number(),
    minClipsPerHour: v.number(),
    maxClipsPerHour: v.number(),
  },
  handler: async (ctx, args) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

    // Fetch transcript
    const transcript = await ctx.runQuery(
      internal.app.podcastClipperClipsDb.getTranscriptInternal,
      { transcriptId: args.transcriptId as any }
    );

    if (!transcript) throw new Error("Transcript not found");

    // Build transcript text with speaker names
    const speakerNames = transcript.speakerNames ?? {};
    let lastSpeaker = "";
    let transcriptText = "";
    for (const word of transcript.words) {
      if (word.type !== "word") continue;
      const speaker = word.speakerId
        ? (speakerNames[word.speakerId] ?? word.speakerId)
        : "";
      if (speaker && speaker !== lastSpeaker) {
        transcriptText += `\n[${speaker}]: `;
        lastSpeaker = speaker;
      }
      transcriptText += word.text + " ";
    }

    // Calculate target clip count
    const lastWord = transcript.words[transcript.words.length - 1];
    const durationHours = lastWord ? lastWord.end / 3600 : 1;
    const minClips = Math.max(1, Math.round(durationHours * args.minClipsPerHour));
    const maxClips = Math.max(minClips, Math.round(durationHours * args.maxClipsPerHour));

    const prompt = `You are an expert at identifying viral podcast moments. Analyze this podcast transcript and find the ${minClips}-${maxClips} most engaging, viral-worthy moments.

For each clip, provide:
- startTime: seconds from start (must align with word timestamps in transcript)
- endTime: seconds from start
- hookText: a short, attention-grabbing caption (1-2 sentences, under 100 chars) that would make someone stop scrolling
- title: a brief descriptive title for the clip
- reason: why this moment is viral-worthy

Rules:
- Each clip must be between ${args.minClipDuration} and ${args.maxClipDuration} seconds long
- Clips should capture complete thoughts/exchanges — don't cut mid-sentence
- Look for: surprising revelations, emotional moments, funny exchanges, controversial takes, inspiring quotes, heated debates
- Hook text should be provocative/intriguing, NOT a summary — make viewers want to watch
- Clips can overlap if the same section has multiple good entry/exit points

Respond with ONLY valid JSON array, no markdown:
[{"startTime": 0, "endTime": 0, "hookText": "", "title": "", "reason": ""}]

TRANSCRIPT:
${transcriptText}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Parse JSON from response (handle potential markdown wrapping)
    let clipsJson: any[];
    try {
      const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      clipsJson = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${content.slice(0, 500)}`);
    }

    if (!Array.isArray(clipsJson) || clipsJson.length === 0) {
      throw new Error("AI returned no clips");
    }

    // Save clips to DB
    await ctx.runMutation(
      internal.app.podcastClipperClipsDb.saveGeneratedClips,
      {
        folderId: args.folderId as any,
        videoId: args.videoId as any,
        transcriptId: args.transcriptId as any,
        clips: clipsJson.map((c: any, i: number) => ({
          startTime: Number(c.startTime),
          endTime: Number(c.endTime),
          hookText: String(c.hookText ?? ""),
          title: String(c.title ?? `Clip ${i + 1}`),
          aiReason: String(c.reason ?? ""),
          clipIndex: i,
        })),
      }
    );
  },
});
