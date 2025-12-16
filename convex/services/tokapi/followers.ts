import { TOKAPI_OPTIONS } from "./utils";

export type FollowerData = {
    region: string;
    follower_count: number;
    unique_id: string;
    nickname: string;
};

export type FollowersResponse = {
    followers: FollowerData[];
    min_time?: number;
};

// Plain TypeScript function that can be called directly
export async function fetchFollowersPage(
    userId: string,
    offset: number = 0
): Promise<FollowersResponse> {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const params = new URLSearchParams({
                count: "200",
                offset: offset.toString(),
            });

            const url = `https://api.tokapi.online/v1/user/${userId}/followers?${params}`;
            const response = await fetch(url, TOKAPI_OPTIONS);
            const data = await response.json();
            const followers = data.followers;

            if (!Array.isArray(followers)) {
                throw new Error("Invalid response from TokAPI: followers is not an array");
            }

            // Map to typesafe response with only required fields
            return {
                followers: followers.map((follower: any): FollowerData => ({
                    region: follower.region ?? "",
                    follower_count: follower.follower_count ?? 0,
                    unique_id: follower.unique_id ?? "",
                    nickname: follower.nickname ?? "",
                })),
                min_time: data.min_time,
            };
        } catch {
            console.log(`Failed to get followers: ${attempt}/${MAX_RETRIES}`);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 200 * attempt)); // basic backoff
                continue;
            }
            throw new Error('Failed to get followers: Unknown error');
        }
    }
    return { followers: [] };
}
