"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { HOOK_SYSTEM_PROMPT, buildClipGenerationPrompt } from "./podcastClipperClipsPrompt";

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
    customPrompt: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

    // Fetch transcript doc
    const transcript = await ctx.runQuery(
      internal.app.podcastClipperClipsDb.getTranscriptInternal,
      { transcriptId: args.transcriptId as any }
    );

    if (!transcript) throw new Error("Transcript not found");

    // Load words from storage or inline
    let words: Array<{ text: string; start: number; end: number; type: string; speakerId?: string }> = transcript.words ?? [];
    if (transcript.wordsStorageId) {
      const blob = await ctx.storage.get(transcript.wordsStorageId);
      if (blob) {
        words = JSON.parse(await blob.text());
      }
    }

    // Build transcript text with speaker names
    const speakerNames = transcript.speakerNames ?? {};
    let lastSpeaker = "";
    let transcriptText = "";
    for (const word of words) {
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
    // Use ceil for min to ensure we always meet the user's minimum expectation
    const lastWord = words[words.length - 1];
    const durationHours = lastWord ? Math.max(lastWord.end / 3600, 0.5) : 1;
    const minClips = Math.max(args.minClipsPerHour, Math.ceil(durationHours * args.minClipsPerHour));
    const maxClips = Math.max(minClips, Math.ceil(durationHours * args.maxClipsPerHour));

    const prompt = args.customPrompt
      ? args.customPrompt + `\n\nTRANSCRIPT:\n${transcriptText}`
      : buildClipGenerationPrompt({
          speakerNames,
          minClips,
          maxClips,
          minClipDuration: args.minClipDuration,
          maxClipDuration: args.maxClipDuration,
          transcriptText,
        });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model || "anthropic/claude-opus-4.6",
        messages: [
          { role: "system", content: HOOK_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
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

    // Filter out clips that violate duration constraints
    clipsJson = clipsJson.filter((c: any) => {
      const duration = Number(c.endTime) - Number(c.startTime);
      return duration >= args.minClipDuration && duration <= args.maxClipDuration;
    });

    // Cap to maxClips
    if (clipsJson.length > maxClips) {
      clipsJson = clipsJson.slice(0, maxClips);
    }

    if (clipsJson.length === 0) {
      throw new Error("No clips matched the duration constraints");
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
          clipIndex: i,
        })),
      }
    );
  },
});
