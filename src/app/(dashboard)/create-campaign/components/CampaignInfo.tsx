"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Zap } from "lucide-react"

interface CampaignInfoProps {
    campaignName: string
    setCampaignName: (name: string) => void
    campaignType: "custom" | "express"
    setCampaignType: (type: "custom" | "express") => void
    campaignNameError: boolean
}

export function CampaignInfo({
    campaignName,
    setCampaignName,
    campaignType,
    setCampaignType,
    campaignNameError
}: CampaignInfoProps) {
    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${campaignNameError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                    <Zap className="w-7 h-7" />
                    <h2 className="text-2xl font-semibold">Create A New Campaign</h2>
                </div>
                <div className="space-y-8">
                    <div className="space-y-2">
                        <Label className="text-base text-muted-foreground">Campaign Name</Label>
                        <Input
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            className="text-lg h-12 focus-visible:ring-1"
                            placeholder="Enter campaign name"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base text-muted-foreground">Campaign Setup Method</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setCampaignType("custom")}
                                className={`group relative flex flex-col gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${campaignType === "custom" ? "ring-2 ring-primary" : ""}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-6 h-6" />
                                    <h3 className="font-semibold text-lg">Custom Campaign</h3>
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium">
                                        RECOMMENDED
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Unlock full creative power by adding videos, photos, and other assets to craft a personalized video experience that is bespoke to you.
                                </p>
                            </button>

                            <button
                                onClick={() => setCampaignType("express")}
                                className={`flex flex-col gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${campaignType === "express" ? "ring-2 ring-primary" : ""}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Zap className="w-6 h-6" />
                                    <h3 className="font-semibold text-lg">Express Campaign</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Short for time? Start creating videos instantly by simply uploading your audio. Perfect for quick and effortless video generation.
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
} 