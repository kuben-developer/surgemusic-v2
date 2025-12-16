import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function getEmbedding(text: string): Promise<number[]> {
    const response = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    })
    return response.data[0].embedding;
}

export type NicheAnalysis = {
    niches: Array<{
        name: string;
        searchPhrases: string[];
    }>;
};

export async function analyzeNiches(captions: string): Promise<NicheAnalysis> {
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a content analysis expert. Analyze the provided TikTok video captions to identify the top 3 content niches and generate 3-5 search phrases per niche that would help find semantically similar content. Return your response as JSON with the structure: { \"niches\": [{ \"name\": \"niche name\", \"searchPhrases\": [\"phrase1\", \"phrase2\", ...] }] }"
            },
            {
                role: "user",
                content: `Analyze these TikTok video captions and identify the top 3 content niches. For each niche, provide 3-5 search phrases optimized for semantic search:\n\n${captions}`
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    });

    const result = response.choices[0].message.content;
    if (!result) {
        throw new Error("No response from OpenAI");
    }

    return JSON.parse(result) as NicheAnalysis;
}

export type CommentAnalysis = {
    sentiment: {
        overall: "positive" | "negative" | "mixed" | "neutral";
        positivePercentage: number;
        negativePercentage: number;
        neutralPercentage: number;
    };
    themes: Array<{
        name: string;
        description: string;
        count: number;
    }>;
    insights: Array<{
        title: string;
        description: string;
    }>;
    summary: string;
};

export async function analyzeComments(comments: Array<{ text: string; likes: number }>): Promise<CommentAnalysis> {
    // Prepare comments for analysis - prioritize by likes
    const sortedComments = [...comments]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 50); // Analyze top 50 comments

    const commentTexts = sortedComments.map((c, i) => `${i + 1}. ${c.text} (${c.likes} likes)`).join('\n');

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a social media analytics expert. Analyze the provided TikTok video comments to understand audience sentiment, identify key themes, and provide actionable insights.

Return your response as JSON with the structure:
{
  "sentiment": {
    "overall": "positive" | "negative" | "mixed" | "neutral",
    "positivePercentage": number,
    "negativePercentage": number,
    "neutralPercentage": number
  },
  "themes": [
    {
      "name": "theme name",
      "description": "brief description",
      "count": number of comments related to this theme
    }
  ],
  "insights": [
    {
      "title": "insight title",
      "description": "detailed insight"
    }
  ],
  "summary": "2-3 sentence overall summary of the comments"
}`
            },
            {
                role: "user",
                content: `Analyze these TikTok video comments. Identify sentiment, key themes (top 3-5), and provide actionable insights:\n\n${commentTexts}`
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    });

    const result = response.choices[0].message.content;
    if (!result) {
        throw new Error("No response from OpenAI");
    }

    return JSON.parse(result) as CommentAnalysis;
}

// Batch niche analysis for Profile Insights feature
// Analyzes up to 25 profiles in a single API request
export type BatchNicheAnalysisInput = {
  accountId: string;
  username: string;
  captions: string; // Concatenated video descriptions
};

export type BatchNicheAnalysisResult = {
  results: Array<{
    accountId: string;
    niches: string[]; // Array of 1-3 niche names
  }>;
};

export async function analyzeBatchNiches(
  profiles: BatchNicheAnalysisInput[]
): Promise<BatchNicheAnalysisResult> {
  if (profiles.length === 0) {
    return { results: [] };
  }

  // Format profiles for the prompt
  const profilesText = profiles
    .map((p, i) => `--- PROFILE ${i + 1} (ID: ${p.accountId}, @${p.username}) ---\n${p.captions.slice(0, 1500)}`)
    .join("\n\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a content niche classifier. Analyze TikTok video captions from multiple creators and identify the specific content niches for each.

For each profile, identify 1-3 content niches that best describe their content. Be specific and descriptive - don't limit yourself to generic categories. Identify the actual topics, themes, and subject matter the creator focuses on.

Return your response as JSON with this exact structure:
{
  "results": [
    { "accountId": "profile_id", "niches": ["Specific Niche 1", "Specific Niche 2"] },
    ...
  ]
}

Important:
- Be specific about the niche (e.g., "Korean Skincare" instead of just "Beauty", "Startup Entrepreneurship" instead of just "Business")
- Keep niche names concise but descriptive (1-4 words)
- Return results in the same order as the input profiles
- If content is unclear or mixed, pick the most dominant niches
- Identify the actual content themes, not just broad categories`
      },
      {
        role: "user",
        content: `Analyze these ${profiles.length} TikTok creator profiles and identify their specific content niches:\n\n${profilesText}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 16384,
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(result) as BatchNicheAnalysisResult;
}

// Aggregate similar niches and rank top 5 for a user's profile
export type NicheAggregationInput = {
  niche: string;
  count: number; // Number of followed accounts with this niche
};

export type RankedNiche = {
  name: string;
  count: number;
  percentage: number;
  rank: number; // 1-5, where 1 is the strongest match
  searchPhrases: string[]; // 3-5 descriptive search phrases for future use
  searchKeywords: string[]; // 3-5 short keywords (1-3 words) for caption/hashtag matching
};

export type NicheAggregationResult = {
  topNiches: RankedNiche[];
};

export async function aggregateAndRankNiches(
  niches: NicheAggregationInput[],
  totalAccounts: number
): Promise<NicheAggregationResult> {
  if (niches.length === 0) {
    return { topNiches: [] };
  }

  // Format niches for the prompt
  const nichesText = niches
    .sort((a, b) => b.count - a.count)
    .slice(0, 100) // Send top 100 raw niches to AI for better aggregation
    .map((n) => `"${n.niche}": ${n.count} accounts`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a content niche analyst. Given a list of content niches with their occurrence counts from a user's followed TikTok accounts, your task is to:

1. Group similar/related niches together (e.g., "Home Workouts", "Gym Tips", "Fitness Motivation" could be grouped as "Fitness & Workouts")
2. Sum the counts of grouped niches
3. Select the TOP 5 most significant and specific niches for this user
4. Rank them from 1 (strongest match) to 5 (weakest among top 5)
5. For each niche, generate BOTH:
   - searchPhrases: 3-5 descriptive search queries (for future semantic search)
   - searchKeywords: 3-5 short keywords that appear in captions/hashtags

Return your response as JSON with this exact structure:
{
  "topNiches": [
    {
      "name": "Specific Niche Name",
      "count": total_count,
      "percentage": percentage_of_total,
      "rank": 1,
      "searchPhrases": ["descriptive phrase 1", "descriptive phrase 2", "descriptive phrase 3"],
      "searchKeywords": ["keyword1", "keyword2", "keyword3"]
    },
    ...
  ]
}

Important:
- Be specific with niche names - capture the actual content theme, not just broad categories
- The percentage should be based on ${totalAccounts} total followed accounts
- Rank 1 = strongest affinity, Rank 5 = 5th strongest
- Only return exactly 5 niches (or fewer if there aren't enough distinct categories)

For searchPhrases (descriptive, for future semantic search):
- Can be longer descriptive phrases
- Example for "Music Production": ["music production techniques", "how to mix vocals", "beat making tutorial"]

For searchKeywords (short, for caption/hashtag matching):
- Must be SHORT (1-3 words max), NOT sentences
- Match what creators actually write in captions and hashtags
- NO filler words like "how", "to", "tips", "tutorial", "guide", "best", "for"
- Good examples: ["beat making", "music producer", "studio session", "mixing vocals", "FL Studio"]
- Bad examples: ["how to make beats", "music production tips"]

- Cover different aspects/sub-topics of the niche
- Consider both raw count AND how distinct/meaningful the niche is for the user`
      },
      {
        role: "user",
        content: `Analyze these content niches from a user's ${totalAccounts} followed TikTok accounts. Identify their top 5 content interests and generate short search keywords for each:\n\n${nichesText}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 2000,
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(result) as NicheAggregationResult;
}

// Analyze trending content in a niche to generate insights and content ideas
export type TrendingVideoInput = {
  caption: string;
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
  hashtags: string[];
};

export type NicheTrendAnalysis = {
  trendingSummary: string;
  contentIdeas: Array<{
    idea: string;
    reasoning: string;
  }>;
  topHashtags: string[];
};

export async function analyzeNicheTrends(
  nicheName: string,
  videos: TrendingVideoInput[]
): Promise<NicheTrendAnalysis> {
  if (videos.length === 0) {
    return {
      trendingSummary: "Not enough content to analyze trends.",
      contentIdeas: [],
      topHashtags: [],
    };
  }

  // Prepare video data for the prompt
  const videosText = videos
    .slice(0, 30) // Analyze top 30 videos
    .map((v, i) => `${i + 1}. "${v.caption}" (${v.views.toLocaleString()} views, ${v.engagementRate.toFixed(1)}% engagement, hashtags: ${v.hashtags.slice(0, 5).join(", ") || "none"})`)
    .join("\n");

  // Collect all hashtags
  const allHashtags = videos.flatMap(v => v.hashtags);
  const hashtagCounts = new Map<string, number>();
  allHashtags.forEach(tag => {
    hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
  });
  const topHashtags = Array.from(hashtagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a TikTok content strategist. Analyze trending videos in a specific content niche to identify patterns, trends, and generate actionable content ideas.

Return your response as JSON with this exact structure:
{
  "trendingSummary": "2-3 sentence summary of what's currently trending in this niche, what themes are popular, and what content style is performing well",
  "contentIdeas": [
    {
      "idea": "Specific content idea title",
      "reasoning": "Why this would perform well based on the trends"
    }
  ]
}

Important:
- Analyze the captions to identify common themes, hooks, and content angles
- Look for patterns in high-performing content
- Generate 3-5 specific, actionable content ideas
- Content ideas should be specific enough to execute, not generic
- Consider what makes these videos engaging (hooks, storytelling, format)`
      },
      {
        role: "user",
        content: `Analyze these top performing TikTok videos in the "${nicheName}" niche and identify trends and content opportunities:\n\n${videosText}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 1500,
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(result) as Omit<NicheTrendAnalysis, "topHashtags">;
  return {
    ...parsed,
    topHashtags,
  };
}

export async function analyzeCreatorComments(comments: Array<{ text: string; likes: number; videoId: string }>): Promise<CommentAnalysis> {
    // Prepare comments for analysis - prioritize by likes
    const sortedComments = [...comments]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 100); // Analyze top 100 comments across all videos

    const commentTexts = sortedComments.map((c, i) => `${i + 1}. ${c.text} (${c.likes} likes)`).join('\n');

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a social media analytics expert. Analyze comments from a creator's recent TikTok posts to understand overall audience sentiment, identify recurring themes across their content, and provide actionable insights for their content strategy.

Return your response as JSON with the structure:
{
  "sentiment": {
    "overall": "positive" | "negative" | "mixed" | "neutral",
    "positivePercentage": number,
    "negativePercentage": number,
    "neutralPercentage": number
  },
  "themes": [
    {
      "name": "theme name",
      "description": "brief description of what audience is saying about this theme",
      "count": number of comments related to this theme
    }
  ],
  "insights": [
    {
      "title": "insight title",
      "description": "detailed actionable insight for the creator"
    }
  ],
  "summary": "2-3 sentence overall summary of audience sentiment and engagement patterns across recent content"
}`
            },
            {
                role: "user",
                content: `Analyze these comments from a creator's recent 6 TikTok posts. Identify overall sentiment trends, recurring themes across their content, and provide actionable insights for improving engagement:\n\n${commentTexts}`
            }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    });

    const result = response.choices[0].message.content;
    if (!result) {
        throw new Error("No response from OpenAI");
    }

    return JSON.parse(result) as CommentAnalysis;
}