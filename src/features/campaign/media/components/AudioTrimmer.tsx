"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Check, X, Clock } from "lucide-react"
import {
  formatTime,
  generateWaveformData,
  getAudioDuration,
  isValidTrimSelection,
  trimAudioTo15Seconds
} from "@/utils/audio-trimmer.utils"
import { toast } from "sonner"

interface AudioTrimmerProps {
  audioFile: File
  onConfirm: (trimmedFile: File) => void
  onCancel: () => void
}

export function AudioTrimmer({ audioFile, onConfirm, onCancel }: AudioTrimmerProps) {
  const [startTime, setStartTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>("")

  const audioRef = useRef<HTMLAudioElement>(null)

  // Load audio and generate waveform
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const url = URL.createObjectURL(audioFile)
        setAudioUrl(url)

        const audioDuration = await getAudioDuration(audioFile)
        setDuration(audioDuration)

        const waveform = await generateWaveformData(audioFile)
        setWaveformData(waveform)
      } catch (error) {
        console.error("Failed to load audio:", error)
        toast.error("Failed to load audio file")
      }
    }

    loadAudio()

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioFile])

  // Update current time during playback
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)

      // Stop at the end of 15-second selection
      if (audio.currentTime >= startTime + 15) {
        audio.pause()
        audio.currentTime = startTime
        setIsPlaying(false)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      audio.currentTime = startTime
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [startTime])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      // Start from the selection start time
      audio.currentTime = startTime
      audio.play()
    }
  }

  const handleConfirm = async () => {
    if (!isValidTrimSelection(startTime, duration)) {
      toast.error("Invalid selection. Please ensure 15 seconds doesn't exceed audio duration.")
      return
    }

    setIsProcessing(true)
    toast.info("Trimming audio to 15 seconds...")
    
    try {
      const trimmedFile = await trimAudioTo15Seconds(audioFile, startTime)
      toast.success("Audio trimmed successfully!")
      // Call onConfirm which will handle the upload
      await onConfirm(trimmedFile)
    } catch (error) {
      console.error("Failed to trim audio:", error)
      toast.error("Failed to trim audio. Please try again.")
      setIsProcessing(false)
    }
  }

  const maxStartTime = Math.max(0, duration - 15)
  const endTime = Math.min(startTime + 15, duration)
  const isValidSelection = isValidTrimSelection(startTime, duration)

  // Calculate selection position for visual indicator
  const selectionStartPercent = duration > 0 ? (startTime / duration) * 100 : 0
  const selectionWidthPercent = duration > 0 ? (15 / duration) * 100 : 0

  return (
    <div className="space-y-6 p-6 border rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Trim to 15 Seconds
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isProcessing}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Select a 15-second segment from your audio. Move the slider to choose the start point.
          The selection must be exactly 15 seconds long.
        </p>
      </div>

      {/* Waveform Visualization */}
      <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
        {/* Waveform bars */}
        <div className="absolute inset-0 flex items-end px-2">
          {waveformData.map((amplitude, index) => (
            <div
              key={index}
              className="flex-1 mx-[1px] bg-muted-foreground/30 rounded-t"
              style={{ height: `${amplitude * 100}%` }}
            />
          ))}
        </div>

        {/* Selection overlay */}
        <div
          className="absolute top-0 bottom-0 bg-primary/20 border-l-2 border-r-2 border-primary"
          style={{
            left: `${selectionStartPercent}%`,
            width: `${selectionWidthPercent}%`
          }}
        >
        </div>

        {/* Playback position indicator */}
        {isPlaying && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 transition-all"
            style={{
              left: `${(currentTime / duration) * 100}%`
            }}
          />
        )}
      </div>

      {/* Time Range Display */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Start: {formatTime(startTime)}</span>
        <span className={!isValidSelection ? "text-destructive" : ""}>
          End: {formatTime(endTime)}
        </span>
        <span>Duration: {formatTime(duration)}</span>
      </div>

      {/* Start Time Slider */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Start Position</label>
        <Slider
          value={[startTime]}
          onValueChange={([value]) => setStartTime(value ?? 0)}
          min={0}
          max={maxStartTime}
          step={0.1}
          disabled={isProcessing || duration === 0}
          className="w-full cursor-pointer"
        />
      </div>

      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePlayPause}
          disabled={isProcessing || !isValidSelection}
          className="flex-1"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause Preview
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Preview Selection
            </>
          )}
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={isProcessing || !isValidSelection}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Trimming...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Confirm & Upload
            </>
          )}
        </Button>
      </div>

      {!isValidSelection && duration > 0 && (
        <p className="text-sm text-destructive text-center">
          Selection exceeds audio duration. Please choose an earlier start point.
        </p>
      )}
    </div>
  )
}