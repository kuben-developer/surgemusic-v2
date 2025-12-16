import { TOKAPI_OPTIONS } from "./utils";

export type CommentUser = {
    username: string;
    nickname: string;
    profilePicture: string;
    country: string;
};

export type Comment = {
    id: string;
    text: string;
    likes: number;
    user: CommentUser;
};

export type CommentsResponse = {
    comments: Comment[];
    hasMore: boolean;
    cursor?: number;
    total?: number;
};

// Helper function to map raw comment data to Comment type
function mapComment(rawComment: any): Comment {
    return {
        id: rawComment.cid || "",
        text: rawComment.text || "",
        likes: rawComment.digg_count || 0,
        user: {
            username: rawComment.user?.unique_id || "",
            nickname: rawComment.user?.nickname || "",
            profilePicture: rawComment.user?.avatar_300x300?.url_list?.[0]
                || rawComment.user?.avatar_larger?.url_list?.[0]
                || "",
            country: rawComment.user?.region || "",
        },
    };
}

export async function fetchCommentsByPostId(
    postId: string,
    offset: number = 0,
    count: number = 30
): Promise<CommentsResponse> {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const params = new URLSearchParams({
                count: count.toString(),
                offset: offset.toString(),
                region: "US",
            });

            const url = `https://api.tokapi.online/v1/post/${postId}/comments?${params}`;
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

            if (!Array.isArray(data.comments)) {
                throw new Error("Invalid response from TokAPI: missing or invalid comments field");
            }

            // Map raw comments to typed Comment objects
            const comments = data.comments.map(mapComment);

            return {
                comments,
                hasMore: data.has_more === 1 || data.has_more === true,
                cursor: data.cursor,
                total: data.total,
            };
        } catch (error) {
            console.log(`Failed to fetch comments: ${attempt}/${MAX_RETRIES}`);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 200 * attempt));
                continue;
            }

            if (error instanceof Error) {
                throw new Error(`Failed to get comments: ${error.message}`);
            }
            throw new Error('Failed to get comments: Unknown error');
        }
    }
    return {
        comments: [],
        hasMore: false,
    };
}

export async function fetchCommentReplies(
    postId: string,
    commentId: string,
    offset: number = 0,
    count: number = 30
): Promise<CommentsResponse> {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const params = new URLSearchParams({
                count: count.toString(),
                offset: offset.toString(),
            });

            const url = `https://api.tokapi.online/v1/post/${postId}/comment/${commentId}/replies?${params}`;
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

            if (!Array.isArray(data.comments)) {
                throw new Error("Invalid response from TokAPI: missing or invalid comments field");
            }

            // Map raw comments to typed Comment objects
            const comments = data.comments.map(mapComment);

            return {
                comments,
                hasMore: data.has_more === 1 || data.has_more === true,
                cursor: data.cursor,
                total: data.total,
            };
        } catch (error) {
            console.log(`Failed to fetch comment replies: ${attempt}/${MAX_RETRIES}`);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, 200 * attempt));
                continue;
            }

            if (error instanceof Error) {
                throw new Error(`Failed to get comment replies: ${error.message}`);
            }
            throw new Error('Failed to get comment replies: Unknown error');
        }
    }
    return {
        comments: [],
        hasMore: false,
    };
}
