// Shared prompt constants and builder — safe to import from both server and client

// Hook writing system prompt adapted from proven training pipeline
export const HOOK_SYSTEM_PROMPT = `You are a viral podcast clip hook writer. Your job is to find the best clip-worthy moments from a podcast and write on-screen text hooks for each.

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
export const HOOK_TRAINING_EXAMPLES = [
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

export function buildClipGenerationPrompt(params: {
  speakerNames: Record<string, string>;
  minClips: number;
  maxClips: number;
  minClipDuration: number;
  maxClipDuration: number;
  transcriptText: string;
}): string {
  const { speakerNames, minClips, maxClips, minClipDuration, maxClipDuration, transcriptText } = params;

  const speakerEntries = Object.entries(speakerNames);
  const speakerInfo = speakerEntries.length > 0
    ? `\nSPEAKERS IN THIS PODCAST:\n${speakerEntries.map(([id, name]) => `- ${name}`).join("\n")}\n`
    : "";

  const examplesBlock = HOOK_TRAINING_EXAMPLES
    .map((ex, i) => `${i + 1}. ${ex.hook}`)
    .join("\n");

  return `Find the most viral, controversial, shocking, or debate-worthy moments from this podcast transcript. For each moment, identify the clip boundaries and write a hook.

CRITICAL CONSTRAINTS — YOU MUST FOLLOW THESE EXACTLY:
1. Return EXACTLY ${minClips} to ${maxClips} clips. No more, no less.
2. Each clip MUST be between ${minClipDuration} and ${maxClipDuration} seconds long (endTime - startTime). Any clip outside this range is invalid.
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
- endTime: seconds from start of podcast (MUST be ${minClipDuration}-${maxClipDuration}s after startTime)
- hookText: the on-screen hook text (max 15 words, follow the style of the examples above, include 1-2 emoji at the end)
- title: brief descriptive title

Respond with ONLY a valid JSON array, no markdown, no explanation:
[{"startTime": 0, "endTime": 0, "hookText": "", "title": ""}]

TRANSCRIPT:
${transcriptText}`;
}
