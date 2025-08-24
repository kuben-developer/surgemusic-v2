"use node"

import { v } from "convex/values";
import { action } from "../_generated/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";


const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export const transcribeAudio = action({
  args: {
    audioUrl: v.string(),
  },
  handler: async (_, args) => {
    try {
      console.log("Transcription started for URL:", args.audioUrl);
      
      if (!process.env.ELEVENLABS_API_KEY) {
        console.error("ELEVENLABS_API_KEY is not configured");
        throw new Error("ElevenLabs API key not configured");
      }

      // Fetch the audio file
      console.log("Fetching audio from URL...");
      const audioResponse = await fetch(args.audioUrl);
      if (!audioResponse.ok) {
        console.error(`Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`);
        throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      console.log("Audio fetched, size:", audioBuffer.byteLength, "bytes");
      const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });


      console.log("Calling ElevenLabs API for transcription...");
      const transcription = await elevenlabs.speechToText.convert({
        file: audioBlob,
        modelId: "scribe_v1",
        tagAudioEvents: false, // We don't need audio events for lyrics
        languageCode: "eng",
        diarize: false, // Single speaker for song audio
      });

      console.log("Transcription response received:", JSON.stringify(transcription, null, 2));

      // Extract text from the response
      let transcribedText = "";
      if (transcription && typeof transcription === 'object') {
        // Handle the response based on ElevenLabs API structure
        if ('text' in transcription) {
          transcribedText = (transcription as any).text;
        } else if ('results' in transcription && (transcription as any).results) {
          // Handle multichannel/structured response
          const results = (transcription as any).results;
          if (results.channels && Array.isArray(results.channels) && results.channels.length > 0) {
            // Combine all utterances from the first channel
            transcribedText = results.channels[0].utterances
              ?.map((u: any) => u.text || '')
              .join(' ') || "";
          } else if (results.text) {
            transcribedText = results.text;
          }
        } else if ('utterances' in transcription && Array.isArray((transcription as any).utterances)) {
          // Handle simple utterances array
          transcribedText = (transcription as any).utterances
            .map((u: any) => u.text || '')
            .join(' ');
        }
      }

      if (!transcribedText) {
        console.error("No text found in transcription response:", JSON.stringify(transcription, null, 2));
        throw new Error("Transcription failed - no text returned");
      }
      
      console.log("Transcribed text:", transcribedText);

      // Split text into 15 one-second segments
      const words = transcribedText.split(/\s+/).filter((word: string) => word.length > 0);
      const wordsPerSecond = Math.ceil(words.length / 15);
      const lyrics = [];

      for (let i = 0; i < 15; i++) {
        const startIndex = i * wordsPerSecond;
        const endIndex = Math.min(startIndex + wordsPerSecond, words.length);
        const lineText = words.slice(startIndex, endIndex).join(' ');

        lyrics.push({
          timestamp: i,
          text: lineText,
        });
      }

      console.log("Successfully created lyrics for 15 seconds");
      return {
        success: true,
        lyrics,
        fullText: transcribedText,
      };
    } catch (error) {
      console.error("Transcription error details:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        lyrics: [],
      };
    }
  },
});