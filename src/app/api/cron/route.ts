import { NextResponse } from 'next/server';
import { put } from "@vercel/blob";
import { db } from "@/server/db";

export async function GET() {
    console.log("GETTING /api/cron");

    const days = 30
    const userId = 'user_2wMlUGA4HD8175cddTdsJa7q5nL'
    const { fetchCombinedAnalytics } = await import("@/server/api/routers/campaign");

    // Fetch analytics data filtered by the report's campaign IDs
    // Pass the userId from the report owner since we're accessing it anonymously
    const analyticsData = await fetchCombinedAnalytics(
        [],
        days,
        userId,
        db
    );
    console.log("analyticsData", analyticsData);


    await put('getCombinedAnalytics.json', JSON.stringify(analyticsData), { access: 'public', allowOverwrite: true, });
    return NextResponse.json({ ok: true });
}