import { TOKAPI_OPTIONS } from "./utils";

export type TikTokUserData = {
    accountId: string;
    username: string;
    videoCount: number;
    totalLikes: number;
    followerCount: number;
    followingCount: number;
    instagramId: string;
    youtubeChannelId: string;
    nickname: string;
    bio: string;
    profilePicture: string;
    country: string;
};

// Plain TypeScript function to fetch and map user data
async function fetchUserData(url: string): Promise<TikTokUserData> {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, TOKAPI_OPTIONS);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unable to parse error response');
                throw new Error(`TokAPI error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            // Validate critical response fields
            if (!data?.user) {
                throw new Error("Invalid response from TokAPI: missing user field");
            }

            const user = data.user;

            // Map to typesafe response matching validateTikTokUsername (without status)
            return {
                accountId: user.uid || user.sec_uid,
                username: user.unique_id,
                videoCount: user.aweme_count || 0,
                totalLikes: user.total_favorited || 0,
                followerCount: user.follower_count || 0,
                followingCount: user.following_count || 0,
                instagramId: user.ins_id || "",
                youtubeChannelId: user.youtube_channel_id || "",
                nickname: user.nickname,
                bio: user.signature || "",
                profilePicture: user.avatar_300x300?.url_list?.[0] || user.avatar_larger?.url_list?.[0] || "",
                country: user.region || "",
            };
        } catch (error) {
            console.log(`Failed to fetch user: ${attempt}/${MAX_RETRIES}`);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 200 * attempt));
                continue;
            }

            if (error instanceof TypeError) {
                throw new Error(`Network error while fetching user: ${error.message}`);
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch user: Unknown error');
        }
    }
    throw new Error('Failed to fetch user after retries');
}

export async function userById(userId: string, region?: string): Promise<TikTokUserData> {
    const params = new URLSearchParams({
        region: region ?? "GB",
    });

    const url = `https://api.tokapi.online/v1/user/${userId}?${params}`;
    return fetchUserData(url);
}

export async function userByUsername(username: string, region?: string): Promise<TikTokUserData> {
    // Remove @ symbol if present
    const cleanUsername = username.startsWith('@')
        ? username.slice(1)
        : username;

    const params = new URLSearchParams({
        region: region ?? "GB",
    });

    // Username is in the path, so we need to encode it properly
    const encodedUsername = encodeURIComponent(cleanUsername);
    const url = `https://api.tokapi.online/v1/user/@${encodedUsername}?${params}`;

    return fetchUserData(url);
}
