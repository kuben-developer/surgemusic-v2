"use client"

import { Input } from "@/components/ui/input"
import { Music } from "lucide-react"

interface SongDetailsProps {
    campaignName: string
    setCampaignName: (name: string) => void
    songName: string
    setSongName: (name: string) => void
    artistName: string
    setArtistName: (name: string) => void
    songDetailsError: boolean
    campaignNameError?: boolean
}

export function SongDetails({
    campaignName,
    setCampaignName,
    songName,
    setSongName,
    artistName,
    setArtistName,
    songDetailsError,
    campaignNameError
}: SongDetailsProps) {
    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${(songDetailsError || campaignNameError) ? 'ring-2 ring-red-500' : ''}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                    <Music className="w-7 h-7" />
                    <h2 className="text-2xl font-semibold">Song & Campaign Details</h2>
                </div>
                <p className="text-muted-foreground text-lg">Enter your campaign and song information.</p>
                <div className="grid grid-cols-1 gap-6">
                    <Input 
                        placeholder="Campaign Name" 
                        className="text-lg h-12" 
                        value={campaignName} 
                        onChange={(e) => setCampaignName(e.target.value)} 
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input 
                        placeholder="Song Name" 
                        className="text-lg h-12" 
                        value={songName} 
                        onChange={(e) => setSongName(e.target.value)} 
                    />
                    <Input 
                        placeholder="Artist Name" 
                        className="text-lg h-12" 
                        value={artistName} 
                        onChange={(e) => setArtistName(e.target.value)} 
                    />
                </div>
            </div>
        </section>
    )
} 
