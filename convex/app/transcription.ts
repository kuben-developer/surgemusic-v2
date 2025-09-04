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


      // Helper to pause between retries
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      // Attempt transcription with retries
      const maxAttempts = 3;
      let transcribedText = "";
      let wordsData: Array<{ text: string; start: number; end: number; type: string }> = [];
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Calling ElevenLabs API for transcription (attempt ${attempt}/${maxAttempts})...`);
          const transcription = await elevenlabs.speechToText.convert({
            file: audioBlob,
            modelId: "scribe_v1",
            tagAudioEvents: false, // We don't need audio events for lyrics
            languageCode: "eng",
            diarize: false, // Single speaker for song audio
          });

          console.log("Transcription response received:", JSON.stringify(transcription, null, 2));

          // Extract the full text
          if (transcription && typeof transcription === "object" && "text" in transcription) {
            transcribedText = (transcription as any).text ?? "";
          }

          // Extract the words array with timing information
          if (
            transcription &&
            typeof transcription === "object" &&
            "words" in transcription &&
            Array.isArray((transcription as any).words)
          ) {
            wordsData = (transcription as any).words;
          }

          if (!transcribedText || !wordsData.length) {
            throw new Error("Transcription failed - no text or timing data returned");
          }

          // Success; break out of retry loop
          break;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error(`Transcription attempt ${attempt} failed:`, message);
          if (attempt < maxAttempts) {
            const backoffMs = 500 * attempt; // simple linear backoff
            console.log(`Retrying transcription after ${backoffMs}ms...`);
            await sleep(backoffMs);
            continue;
          }
          // Exhausted retries; rethrow to outer catch
          throw err;
        }
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
        if (extraText && lyrics.length > 0) {
          const lastIndex = lyrics.length - 1;
          const lastLyric = lyrics[lastIndex];
          if (lastLyric) {
            lastLyric.text = lastLyric.text ? `${lastLyric.text} ${extraText}` : extraText;
          }
          console.log(`Added ${wordsAfter15.length} words from beyond 15s to last second`);
        }
      }

      // Create lyricsWithWords that maps each second to specific word indices
      const lyricsWithWords = lyrics.map((line, second) => {
        // Find indices of words that belong to this second
        const wordIndices = actualWords
          .map((word, index) => ({ word, index }))
          .filter(({ word }) => {
            // Word starts within this second interval
            return word.start >= second && word.start < second + 1;
          })
          .map(({ index }) => index);
        
        return {
          timestamp: line.timestamp,
          text: line.text,
          wordIndices,
        };
      });

      // Handle words beyond 15 seconds - add their indices to the last second
      const wordsAfter15Indices = actualWords
        .map((word, index) => ({ word, index }))
        .filter(({ word }) => word.start >= 15)
        .map(({ index }) => index);
      
      if (wordsAfter15Indices.length > 0 && lyricsWithWords.length > 0) {
        const lastIndex = lyricsWithWords.length - 1;
        const lastLyricWithWords = lyricsWithWords[lastIndex];
        if (lastLyricWithWords) {
          lastLyricWithWords.wordIndices.push(...wordsAfter15Indices);
        }
      }

      console.log("Successfully created lyrics for 15 seconds");
      return {
        success: true,
        lyrics,
        fullText: transcribedText,
        wordsData: actualWords, // Return the raw word timing data
        lyricsWithWords, // Return the mapping of seconds to word indices
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
