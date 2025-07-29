"use client"

import { Button } from "@/components/ui/button"
import { UploadDropzone } from "@uploadthing/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { OurFileRouter } from "../api/uploadthing/core"
import { useState, type JSX } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

type Feature = {
  title: string;
  description: string;
  image: string;
  icon: JSX.Element;
}

const features: Feature[] = [
  {
    title: "Generate Captions",
    description: "Create engaging captions tailored to your videos automatically.",
    image: "/features/generate-captions.jpg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    )
  },
  {
    title: "Content Calendar",
    description: "Stay consistent with an automated content calendar.",
    image: "/features/content-calendar.jpg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    )
  },
  {
    title: "Video Creatives",
    description: "Variety of stunning videos optimized for social media.",
    image: "/features/video-creatives.jpg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    )
  },
  {
    title: "Auto Posting",
    description: "Your content distributed through hundreds of genre theme pages.",
    image: "/features/auto-posting.jpg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    )
  },
  {
    title: "Carousel Images",
    description: "Produce eye-catching carousel images for interactive social posts.",
    image: "/features/carousel-images.jpg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    )
  },
  {
    title: "Auto Lyric Transcription",
    description: "Add perfectly synced lyrics to your videos with one click.",
    image: "/features/lyric-transcription.jpg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    )
  }
];

export default function Page() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-10 px-4">
        {/* Simple upload section */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Upload Your Song</h1>
            <p className="text-muted-foreground text-lg">
              Add a 30 second snippet of your best hook or chorus.
              We'll create amazing content for your music promotion.
            </p>
          </div>

          <UploadDropzone<OurFileRouter, "audioUploader">
            endpoint="audioUploader"
            config={{
              mode: "auto"
            }}
            className="border border-dashed rounded-lg p-6 hover:border-foreground/40 transition-all duration-300 cursor-pointer bg-muted/10"
            content={{
              label: "Drop your song here",
              allowedContent: "30 second MP3, WAV or Video"
            }}
            appearance={{
              uploadIcon: "w-8 h-8 text-muted-foreground",
              label: "text-base font-medium mt-3 text-foreground",
              allowedContent: "text-sm text-muted-foreground mt-1",
              button: "bg-primary w-36 text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            }}
            onBeforeUploadBegin={(files) => {
              return files;
            }}
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                router.push(`/create-campaign?songAudioUrl=${encodeURIComponent(res[0].ufsUrl)}`)
              }
            }}
            onUploadError={(error: Error) => {
              if (error.message.includes("FileSizeMismatch")) {
                toast("File Size Too Large - Please upload a smaller file.", {
                  description: "Error uploading file"
                })
              } else {
                toast(`Error: ${error.message}`)
              }
            }}
          />
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-8 sm:mx-14">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border border-border bg-card transition-colors hover:bg-muted/50"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover bg-black"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
