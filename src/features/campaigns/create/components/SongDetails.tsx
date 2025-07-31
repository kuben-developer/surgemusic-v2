"use client"

import { Input } from "@/components/ui/input"
import { Music } from "lucide-react"

interface SongDetailsProps {
    songName: string
    setSongName: (name: string) => void
    artistName: string
    setArtistName: (name: string) => void
    songDetailsError: boolean
}

export function SongDetails({
    songName,
    setSongName,
    artistName,
    setArtistName,
    songDetailsError
}: SongDetailsProps) {
    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${songDetailsError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                    <Music className="w-7 h-7" />
                    <h2 className="text-2xl font-semibold">Song Details</h2>
                </div>
                <p className="text-muted-foreground text-lg">Enter your song name and artist name.</p>
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