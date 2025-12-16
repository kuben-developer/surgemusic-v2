import { TOKAPI_OPTIONS } from "./utils";

export type TikTokPost = {
    id: string;
    desc: string;
    create_time: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    country: string;
    language: string;
    duration: number;
    mediaUrl: string;
    isVideo: boolean;
    musicId: string;
    musicTitle: string;
    isAd: boolean;
    accountId: string;
};

export type UserPostsResponse = {
    aweme_list: TikTokPost[];
    has_more: boolean;
    max_cursor?: number;
    min_cursor?: number;
    status_code: number;
    status_msg?: string;
};

// Helper function to map raw API response to TikTokPost
function mapPost(rawPost: any): TikTokPost {
    const urlList = rawPost.video?.play_addr?.url_list || rawPost.video?.download_addr?.url_list || [];
    const mediaUrl = urlList.length > 0 ? urlList[urlList.length - 1] : "";

    return {
        id: rawPost.aweme_id || "",
        desc: rawPost.desc || "",
        create_time: rawPost.create_time || 0,
        views: rawPost.statistics?.play_count || 0,
        likes: rawPost.statistics?.digg_count || 0,
        comments: rawPost.statistics?.comment_count || 0,
        shares: rawPost.statistics?.share_count || 0,
        saves: rawPost.statistics?.collect_count || 0,
        country: rawPost.region || "",
        language: rawPost.desc_language || "",
        duration: rawPost.video?.duration ? Math.floor(rawPost.video.duration / 1000) : 0,
        mediaUrl,
        isVideo: rawPost.aweme_type === 0,
        musicId: rawPost.music?.id_str || rawPost.music?.mid || "",
        musicTitle: rawPost.music?.title || "",
        isAd: rawPost.is_ads || false,
        accountId: rawPost.author?.uid,
    };
}

export async function fetchUserPosts(
    userId: string,
    offset: number = 0
): Promise<UserPostsResponse> {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const params = new URLSearchParams({
                count: "30",
                offset: offset.toString(),
                region: "US",
                with_pinned_posts: "0",
            });

            const url = `https://api.tokapi.online/v1/post/user/${userId}/posts?${params}`;
            const response = await fetch(url, TOKAPI_OPTIONS);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unable to parse error response');
                throw new Error(`TokAPI error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            // Validate response structure
            if (typeof data.status_code === 'undefined') {
                throw new Error("Invalid response from TokAPI: missing status_code field");
            }

            // Handle "No more videos" response or missing aweme_list
            if (!Array.isArray(data.aweme_list)) {
                // If this is a valid "no more content" response, return empty result
                if (data.status_msg === 'No more videos' || data.aweme_list === null || data.aweme_list === undefined) {
                    return {
                        aweme_list: [],
                        has_more: false,
                        status_code: data.status_code,
                        status_msg: data.status_msg,
                    };
                }
                // Otherwise, it's an invalid response
                console.log(data)
                throw new Error("Invalid response from TokAPI: missing or invalid aweme_list field");
            }

            // Map raw posts to typed TikTokPost objects
            const typedPosts = data.aweme_list.map(mapPost);

            return {
                aweme_list: typedPosts,
                has_more: data.has_more ?? false,
                max_cursor: data.max_cursor,
                min_cursor: data.min_cursor,
                status_code: data.status_code,
                status_msg: data.status_msg,
            };
        } catch (error) {
            console.log(`Failed to get user posts: ${attempt}/${MAX_RETRIES}`);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 200 * attempt));
                continue;
            }

            if (error instanceof Error) {
                throw new Error(`Failed to get user posts: ${error.message}`);
            }
            throw new Error('Failed to get user posts: Unknown error');
        }
    }
    return {
        aweme_list: [],
        has_more: false,
        status_code: -1,
    };
}
