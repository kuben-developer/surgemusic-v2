import { TOKAPI_OPTIONS } from "./utils";

export type FollowingData = {
    region: string;
    follower_count: number;
    unique_id: string;
    nickname: string;
};

export type FollowingsResponse = {
    followings: FollowingData[];
    min_time?: number;
};

// Plain TypeScript function that can be called directly
export async function fetchFollowingsPage(
    userId: string,
    offset: number = 0
): Promise<FollowingsResponse> {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const params = new URLSearchParams({
                count: "200",
                offset: offset.toString(),
            });

            const url = `https://api.tokapi.online/v1/user/${userId}/followings?${params}`;
            const response = await fetch(url, TOKAPI_OPTIONS);
            const data = await response.json();
            const followings = data.followings;

            if (!Array.isArray(followings)) {
                throw new Error("Invalid response from TokAPI: followings is not an array");
            }

            // Map to typesafe response with only required fields
            return {
                followings: followings.map((following: any): FollowingData => ({
                    region: following.region ?? "",
                    follower_count: following.follower_count ?? 0,
                    unique_id: following.unique_id ?? "",
                    nickname: following.nickname ?? "",
                })),
                min_time: data.min_time,
            };
        } catch {
            console.log(`Failed to get followings: ${attempt}/${MAX_RETRIES}`);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 200 * attempt)); // basic backoff
                continue;
            }
            throw new Error('Failed to get followings: Unknown error');
        }
    }
    return { followings: [] };
}

export async function followingsByUserId(userId: string, offset?: number): Promise<FollowingsResponse> {
    return fetchFollowingsPage(userId, offset);
}

export async function getAllFollowings(userId: string): Promise<FollowingData[]> {
    const allFollowings: FollowingData[] = [];
    let offset: number | undefined = 0;

    while (true) {
        const response = await fetchFollowingsPage(userId, offset);

        if (response.followings.length === 0) {
            break;
        }

        allFollowings.push(...response.followings);

        // Use min_time for next offset if available, otherwise break
        if (response.min_time) {
            offset = response.min_time;
        } else {
            break;
        }
    }

    return allFollowings;
}
