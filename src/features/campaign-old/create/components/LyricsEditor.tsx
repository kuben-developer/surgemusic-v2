"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Music2, Edit3, Save, RotateCcw, Clock } from "lucide-react"
import { type LyricsLine } from "@/utils/srt-converter.utils"

interface LyricsEditorProps {
  initialLyrics: LyricsLine[]
  onSave: (lyrics: LyricsLine[]) => void
  onCancel: () => void
  audioBase64?: string | null
}

export function LyricsEditor({ 
  initialLyrics, 
  onSave, 
  onCancel,
  audioBase64 
}: LyricsEditorProps) {
  const [lyrics, setLyrics] = useState<LyricsLine[]>(initialLyrics)
  const [isEditing, setIsEditing] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = document.querySelector('audio') as HTMLAudioElement
    if (audio) {
      const handleTimeUpdate = () => {
        setCurrentTime(Math.floor(audio.currentTime))
      }
      audio.addEventListener('timeupdate', handleTimeUpdate)
      return () => audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  const handleLyricChange = (index: number, text: string) => {
    const updatedLyrics = [...lyrics]
    if (updatedLyrics[index]) {
      updatedLyrics[index].text = text
    }
    setLyrics(updatedLyrics)
  }

  const handleSave = () => {
    const hasEmptyLines = lyrics.some(line => !line.text.trim())
    
    if (hasEmptyLines) {
      toast.warning("Some lines are empty", {
        description: "Please add text to all timestamps or leave them intentionally blank."
      })
    }

    onSave(lyrics)
    setIsEditing(false)
    toast.success("Lyrics saved successfully")
  }

  const handleReset = () => {
    setLyrics(initialLyrics)
    toast.info("Lyrics reset to original")
  }

  const formatTime = (seconds: number) => {
    return `00:${String(seconds).padStart(2, '0')}`
  }

  return (
    <div className="border rounded-xl p-6 space-y-4 bg-card">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-3">
          <Music2 className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Edit Lyrics</h3>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Lyrics
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Again
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Edit the lyrics for each second of your 15-second audio clip. These will be used for subtitles in your videos.
      </p>

      {audioBase64 && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Preview with synchronized lyrics
          </p>
          <audio controls className="w-full">
            <source src={audioBase64} />
          </audio>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {lyrics.map((line, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              currentTime === line.timestamp ? 'bg-primary/10 border-primary' : ''
            }`}
          >
            <span className="text-sm font-mono text-muted-foreground w-12">
              {formatTime(line.timestamp)}
            </span>
            <Input
              value={line.text}
              onChange={(e) => handleLyricChange(index, e.target.value)}
              placeholder="Enter lyrics for this second..."
              disabled={!isEditing}
              className="flex-1"
            />
          </div>
        ))}
      </div>

      {!isEditing && (
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(lyrics)}
          >
            Continue with These Lyrics
          </Button>
        </div>
      )}
    </div>
  )
}