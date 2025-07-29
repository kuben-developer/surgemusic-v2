import { db } from "@/server/db";

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY || "";

export async function POST(req: Request) {
    const body = await req.json();
    console.log("Ayrshare webhook received:", body);

    if (body.action === "social") {
        if (body.type === "link") {
            const profileName = body.title;

            const profile = await db.ayrshareProfile.findUnique({
                where: { profileName },
                select: {
                    profileKey: true,
                },
            });

            if (!profile) {
                return new Response("Profile not found", { status: 404 });
            }

            // Fetch user data from Ayrshare API
            const response = await fetch("https://api.ayrshare.com/api/user", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
                    "Content-Type": "application/json",
                    "Profile-Key": profile.profileKey
                }
            });

            if (!response.ok) {
                return new Response("Failed to fetch user data from Ayrshare", { status: 500 });
            }

            const userData = await response.json();
            console.log("Ayrshare user data:", userData);

            const accounts = userData.displayNames

            for (const account of accounts) {
                if (account.platform === body.platform) {
                    // Create a new social account record in the database
                    await db.socialAccount.create({
                        data: {
                            ayrshareProfile: {
                                connect: {
                                    profileName: profileName
                                }
                            },
                            platform: account.platform,
                            profileUrl: account.profileUrl,
                            userImage: account.userImage,
                            username: account.username,

                        }
                    });

                    console.log(`Created social account record for ${account.platform}: ${account.username}`);
                }

            }
        } else if (body.type === "unlink") {
            const profileName = body.title;
            const platform = body.platform;

            await db.socialAccount.deleteMany({
                where: { ayrshareProfileName: profileName, platform: platform }
            });
        }
    } else if (body.action === "scheduled") {

        const post = await db.generatedVideo.findFirst({
            where: { postId: body.id },
            include: {
                campaign: true,
                scheduledSocialAccounts: {
                    include: {
                        ayrshareProfile: true
                    }
                }
            }
        });

        if (!post) {
            return new Response("Post not found", { status: 404 });
        }

        console.log("Post:", JSON.stringify(post, null, 2));

        if (body.errors.length > 0) {
            const failedPlatform = body.platforms[0]

            if (failedPlatform == "tiktok") {
                await db.generatedVideo.update({
                    where: { id: post.id },
                    data: {
                        tiktokFailedReason: body.errors[0].message
                    }
                });
            } else if (failedPlatform == "instagram") {
                await db.generatedVideo.update({
                    where: { id: post.id },
                    data: {
                        instagramFailedReason: body.errors[0].message
                    }
                });
            } else if (failedPlatform == "youtube") {
                await db.generatedVideo.update({
                    where: { id: post.id },
                    data: {
                        youtubeFailedReason: body.errors[0].message
                    }
                });
            }
        }


        // Extract successful platforms from the postIds array
        const successfulPlatforms = body.postIds
            .filter((postInfo: any) => postInfo.status === "success")
            .map((postInfo: any) => postInfo.platform);

        console.log("Successful platforms:", successfulPlatforms);

        const tiktokUrl = body.postIds.find((postInfo: any) => postInfo.platform === "tiktok")?.postUrl || null;
        const instagramUrl = body.postIds.find((postInfo: any) => postInfo.platform === "instagram")?.postUrl || null;
        const youtubeUrl = body.postIds.find((postInfo: any) => postInfo.platform === "youtube")?.postUrl || null;

        console.log("Tiktok URL:", tiktokUrl);
        console.log("Instagram URL:", instagramUrl);
        console.log("Youtube URL:", youtubeUrl);

        if (!tiktokUrl && !instagramUrl && !youtubeUrl) {
            return new Response("No URLs found", { status: 404 });
        }

        // Update the database record with posting status for each platform
        await db.generatedVideo.update({
            where: { id: post.id },
            data: {
                tiktokPosted: successfulPlatforms.includes("tiktok") && tiktokUrl ? true : false,
                instagramPosted: successfulPlatforms.includes("instagram") && instagramUrl ? true : false,
                youtubePosted: successfulPlatforms.includes("youtube") && youtubeUrl ? true : false,
                tiktokUrl: tiktokUrl,
                instagramUrl: instagramUrl,
                youtubeUrl: youtubeUrl,
            }
        });

    }


    return new Response(null, { status: 200 });
} 