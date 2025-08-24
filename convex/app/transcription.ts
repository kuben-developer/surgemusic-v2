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

      // Extract text and words timing from the response
      let transcribedText = "";
      let wordsData: Array<{ text: string; start: number; end: number; type: string }> = [];
      
      if (transcription && typeof transcription === 'object') {
        // Extract the full text
        if ('text' in transcription) {
          transcribedText = (transcription as any).text;
        }
        
        // Extract the words array with timing information
        if ('words' in transcription && Array.isArray((transcription as any).words)) {
          wordsData = (transcription as any).words;
        }
      }

      if (!transcribedText || !wordsData.length) {
        console.error("No text or word timing found in transcription response:", JSON.stringify(transcription, null, 2));
        throw new Error("Transcription failed - no text or timing data returned");
      }
      
      console.log("Transcribed text:", transcribedText);
      console.log(`Found ${wordsData.length} word entries with timing`);

      // Filter to get only actual words (exclude spacing and punctuation)
      const actualWords = wordsData.filter(w => w.type === 'word');
      console.log(`Processing ${actualWords.length} actual words`);

      // Group words into 1-second intervals based on their start time
      const lyrics = [];
      
      for (let second = 0; second < 15; second++) {
        // Find all words that start within this second
        const wordsInThisSecond = actualWords.filter(word => {
          // Word starts within this second interval
          return word.start >= second && word.start < second + 1;
        });
        
        // Join the words for this second
        const lineText = wordsInThisSecond
          .map(w => w.text)
          .join(' ')
          .trim();
        
        lyrics.push({
          timestamp: second,
          text: lineText,
        });
        
        if (lineText) {
          console.log(`Second ${second}: "${lineText}" (${wordsInThisSecond.length} words)`);
        }
      }
      
      // Handle any words that might be beyond 15 seconds by adding them to the last second
      const wordsAfter15 = actualWords.filter(word => word.start >= 15);
      if (wordsAfter15.length > 0) {
        const extraText = wordsAfter15.map(w => w.text).join(' ').trim();
        if (extraText) {
          lyrics[14].text = lyrics[14].text ? `${lyrics[14].text} ${extraText}` : extraText;
          console.log(`Added ${wordsAfter15.length} words from beyond 15s to last second`);
        }
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