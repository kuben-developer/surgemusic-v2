"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// ============================================================
// AI CLIP GENERATION ACTION (Node.js runtime)
// ============================================================

// Hook writing system prompt adapted from proven training pipeline
const HOOK_SYSTEM_PROMPT = `You are a viral podcast clip hook writer. Your job is to find the best clip-worthy moments from a podcast and write on-screen text hooks for each.

HOOK WRITING RULES:
- Maximum 15 words per hook
- The hook appears as text overlaid on the video — it must make someone stop scrolling
- Be SPECIFIC to what's discussed. A generic hook that could apply to any clip is a bad hook.
- The hook should tease the specific insight/story WITHOUT fully giving it away
- Use CAPS strategically for emphasis

PATTERNS TO FOLLOW:
- Often starts with a compelling descriptor of the speaker (e.g., "Ibiza's wildest party animal", "London promoter", "Famous DJ")
- Uses power verbs: "reveals", "exposes", "explains why"
- Creates a curiosity gap — hints at something shocking/surprising
- Sometimes uses question format to hook the viewer

USING SPEAKER NAMES IN HOOKS:
- You will be given the real names of the speakers in the podcast. You DON'T need to use their name in every hook — most hooks work fine without naming anyone.
- If a speaker is a HOUSEHOLD NAME that most people would instantly recognize (e.g., Cameron Diaz, Joe Rogan, Gordon Ramsay), their name alone creates curiosity — USE IT. Example: "Cameron Diaz Admits: 'I Married Up' 😳"
- If the speaker is NOT widely known, use a compelling DESCRIPTOR instead of their name: their job title, role, or claim to fame. Example: "Divorce lawyer reveals the #1 thing that destroys marriages 😳"
- If the speaker is well-known WITHIN A NICHE but not a household name, combine both or use a punchy descriptor. Example: "Pacha boss Danny Whittle reveals..."
- When in doubt, skip the name entirely or use a descriptor — an intriguing descriptor always works, an unknown name never does
- Only include a speaker reference when it adds value to the hook. Many great hooks don't mention the speaker at all (e.g., "HOW TO MAKE MONEY FROM RAVING 🤯")

EMOJI RULES:
Place 1-2 emojis at the END of the hook. Choose based on the dominant emotional tone:

😳 — embarrassing moments, shocking reveals, "I can't believe they said that"
🤐 — secrets being shared, insider tips, "you're not supposed to know this"
🤯 — impressive facts, mind-blowing information, crazy stories
💸 — money talk, business deals, expensive things, financial reveals
😱 — genuinely shocking/scary stories, betrayals, dramatic twists
🤫 — secretive information, insider tips, lies exposed, hidden truths
😔 — sad stories, depression, grief, someone being treated badly
👀 — curious/strange topics, weird facts, provocative questions
🤔 — thought-provoking questions, debatable topics
😂 — funny stories, embarrassing fails, humorous moments
😈 — cool/powerful moments, flexing, badass energy
🤬 — angry rants, infuriating situations, injustice

Combine up to 2 emojis if the clip hits two tones. Never more than 2.

TONE — BE PROVOCATIVE:
- Find the most polarizing, debatable, or shocking interpretation
- Frame it to make people NEED to comment, argue, or share
- Slightly exaggerate or editorialize — you're writing for virality, not accuracy
- Use words that provoke: "admits", "exposes", "confesses", "the truth about", "the real reason"
- NEVER be bland, neutral, or journalistic

PROVOCATIVE LANGUAGE:
- Use absolutist language: "WORTHLESS", "NEVER", "the ONLY thing", "#1 reason"
- Frame insights as attacks on common beliefs
- Use "you" and "your" to make it personal and confrontational
- Pose it as a challenge or hot take, not a neutral observation`;

// 36 training examples from proven hook generation pipeline
const HOOK_TRAINING_EXAMPLES = [
  { hook: "O Beach Owner Explains Why No One Has Phones At His Club" },
  { hook: "Ibiza's wildest party animal explains why Ibiza is full of clout chasers" },
  { hook: "Ibiza's biggest influencer exposes Ibiza corruption" },
  { hook: "Ibiza's wildest partier: TOP SECRET no-phone room 😳🤐" },
  { hook: "HOW TO MAKE MONEY FROM RAVING 🤯" },
  { hook: "IBIZAS BIGGEST PARTY ANIMAL: HOW TO MAKE MONEY FROM PARTYING 💸" },
  { hook: "Ibiza Pioneer: The biggest DJs I've booked 🤯" },
  { hook: "Ibiza Promoter Betrayed by Pacha Nightclub 😱 *SHOCKING*" },
  { hook: "Ibiza's biggest party animal reveals why money has ruined the island 😳🤫" },
  { hook: "YOU WON'T BELIEVE HOW MUCH THIS PROMOTER PAID FOR THIS TOP DJ 😳💸" },
  { hook: "LONDON PROMOTER EXPOSES NIGHTCLUB GANG RIVALRIES 😳" },
  { hook: "LONDON PROMOTER REVEALS CRAZY PARTY LIFESTYLE OF RUGBY PLAYERS" },
  { hook: "FAMOUS DJ REVEALS HIS TOP LONDON NIGHTCLUB RECOMMENDATIONS 😳😱" },
  { hook: "DJ REVEALS WHAT EARLY IBIZA WAS LIKE 🤯😳" },
  { hook: "WHY ALL THE GOOD DJS WENT TO IBIZA 😳🤐" },
  { hook: "IBIZA PROMOTER: HOW TO BOOK THE TOP DJS 🤫💸" },
  { hook: "DJ FAT TONY: Being gay in the 80s and 90s" },
  { hook: "IBIZA PARTY ANIMAL REVEALS HIS WILDEST PARTY 😳 *SHOCKING*" },
  { hook: "HAS IBIZA LOST ITS MAGIC? 😔" },
  { hook: "HAS IBIZA CHANGED FOR THE WORSE? 👀🤔" },
  { hook: "HOW PACHA IBIZA BECAME A GIANT 😳" },
  { hook: "IBIZA DJS CRAZIEST PARTY STORY 😳😂" },
  { hook: "HOW THIS PROMOTER PACKED OUT CLUBS AS A UNI STUDENT 💸😈" },
  { hook: "HOW THIS NIGHTCLUB PROMOTER MADE 3K A WEEK AS A STUDENT 🤯🤫" },
  { hook: "UK #1 PROMOTER ON THE CRAZY COST OF RUNNING A FESTIVAL 😳💸" },
  { hook: "THE CRAZY RISK OF RUNNING FESTIVALS: \"IT WAS MADNESS\" 🤯" },
  { hook: "IBIZA BIGGEST CLUB FORCES BAR TO SHUT DOWN 🤬😳" },
  { hook: "IBIZA NIGHTCLUB SELLS FOR $350 MILLION" },
  { hook: "THE NIGHTCLUB THAT REJECTED P-DIDDY 😳😂" },
  { hook: "IBIZAS WILDEST PARTIER TELLS STORY OF WHEN HE BEAT UP A COP 😳😂" },
  { hook: "IBIZA NIGHTCLUB BOSS BUYS HIS DJS VILLAS 😳💸" },
  { hook: "IBIZA BOSS REVEALS THE BIGGEST PROBLEM DJ GROUPS FACE 🤫🤐" },
  { hook: "DJ ROBBED FOR 24K *SHOCKING*" },
  { hook: "IBIZA PROMOTER REVEALS HOW HE MET LONDONS MOST DANGEROUS GANGSTER 😳🤫" },
  { hook: "DJ REVEALS THE MOST HE WAS EVER PAID FOR A SHOW 😳🤯" },
  { hook: "HAS IBIZA BEEN ABANDONED BY YOUNG PEOPLE 😳🤔" },
];

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

    // Build speaker info for the prompt
    const speakerEntries = Object.entries(speakerNames);
    const speakerInfo = speakerEntries.length > 0
      ? `\nSPEAKERS IN THIS PODCAST:\n${speakerEntries.map(([id, name]) => `- ${name}`).join("\n")}\n`
      : "";

    // Build training examples block
    const examplesBlock = HOOK_TRAINING_EXAMPLES
      .map((ex, i) => `${i + 1}. ${ex.hook}`)
      .join("\n");

    const prompt = `Find the most viral, controversial, shocking, or debate-worthy moments from this podcast transcript. For each moment, identify the clip boundaries and write a hook.

CRITICAL CONSTRAINTS — YOU MUST FOLLOW THESE EXACTLY:
1. Return EXACTLY ${minClips} to ${maxClips} clips. No more, no less.
2. Each clip MUST be between ${args.minClipDuration} and ${args.maxClipDuration} seconds long (endTime - startTime). Any clip outside this range is invalid.
3. Don't cut mid-sentence — find natural start/end points.
4. Clips can overlap if both moments are strong.
${speakerInfo}
CONTENT SELECTION:
- PRIORITIZE: hot takes, disagreements, confessions, unpopular opinions, "I can't believe they said that" moments, emotional outbursts, mind-blowing facts, money reveals, controversial opinions, personal stories
- AVOID: generic introductions, boring agreements, small talk, filler, generic advice

HERE ARE 36 EXAMPLES OF GOOD HOOKS — study and match this style:
${examplesBlock}

For each clip provide:
- startTime: seconds from start of podcast
- endTime: seconds from start of podcast (MUST be ${args.minClipDuration}-${args.maxClipDuration}s after startTime)
- hookText: the on-screen hook text (max 15 words, follow the style of the examples above, include 1-2 emoji at the end)
- title: brief descriptive title

Respond with ONLY a valid JSON array, no markdown, no explanation:
[{"startTime": 0, "endTime": 0, "hookText": "", "title": ""}]

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
