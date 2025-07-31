import { Suspense } from "react"
import AnalyticsClient from "./analytics-client"

export default function CampaignAnalyticsPage() {
    return (
        <Suspense fallback={
            <div className="container max-w-5xl mx-auto py-12">
                <div className="space-y-8">
                    <section className="bg-card rounded-xl p-8 shadow-sm border">
                        <div className="space-y-6">
                            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-24 w-full bg-muted animate-pulse rounded" />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        }>
            <AnalyticsClient />
        </Suspense>
    )
} 