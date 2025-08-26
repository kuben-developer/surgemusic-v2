export function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

interface WordData {
  text: string;
  start: number;
  end: number;
  type: string;
  logprob?: number;
}

/**
 * Generate SRT with 1 word at a time
 * Each word displays for its exact duration from ElevenLabs
 */
export function generateSingleWordSRT(wordsData: WordData[]): string {
  const srtLines: string[] = [];
  let subtitleNumber = 1;

  for (const word of wordsData) {
    srtLines.push(String(subtitleNumber));
    srtLines.push(`${formatSRTTime(word.start)} --> ${formatSRTTime(word.end)}`);
    srtLines.push(word.text);
    srtLines.push('');
    subtitleNumber++;
  }

  return srtLines.join('\n').trim();
}

/**
 * Generate SRT with multiple words at a time
 * @param wordsData - Array of word timing data
 * @param wordCount - Number of words to display at once (2-5)
 * @param totalDuration - Total duration of the audio (default 15 seconds)
 */
export function generateMultiWordSRT(
  wordsData: WordData[], 
  wordCount: number,
  totalDuration: number = 15
): string {
  const srtLines: string[] = [];
  let subtitleNumber = 1;
  let i = 0;

  while (i < wordsData.length) {
    // Get the next group of words
    const wordGroup = wordsData.slice(i, Math.min(i + wordCount, wordsData.length));
    
    if (wordGroup.length === 0) break;

    // Calculate start time (from first word in group)
    const firstWord = wordGroup[0];
    if (!firstWord) continue;
    const startTime = firstWord.start;
    
    // Calculate end time
    let endTime: number;
    
    // For the last group or if we're near the end
    if (i + wordCount >= wordsData.length) {
      // Use the end time of the last word in the group, or totalDuration if it's the last group
      const lastWord = wordGroup[wordGroup.length - 1];
      endTime = lastWord ? Math.min(lastWord.end + 0.5, totalDuration) : totalDuration;
    } else {
      // Look ahead to the next group's start time
      const nextWord = wordsData[Math.min(i + wordCount, wordsData.length - 1)];
      const nextGroupStart = nextWord ? nextWord.start : totalDuration;
      
      // Calculate proportional display duration
      // More words = longer display time
      const lastWord = wordGroup[wordGroup.length - 1];
      const baseDuration = lastWord ? (lastWord.end - startTime) : 1;
      const extendedDuration = baseDuration * (1 + (wordCount - 1) * 0.3); // Add 30% more time per additional word
      
      endTime = Math.min(startTime + extendedDuration, nextGroupStart - 0.01, totalDuration);
    }

    // Join the words in the group
    const text = wordGroup.map(w => w.text).join(' ').trim();
    
    // Add to SRT
    srtLines.push(String(subtitleNumber));
    srtLines.push(`${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}`);
    srtLines.push(text);
    srtLines.push('');
    
    subtitleNumber++;
    i += wordCount;
  }

  return srtLines.join('\n').trim();
}

/**
 * Generate all 5 SRT variations
 * @param wordsData - Array of word timing data from ElevenLabs
 * @returns Array of 5 SRT strings
 */
export function generateAllSRTVariations(wordsData: WordData[]): string[] {
  if (!wordsData || wordsData.length === 0) {
    return ['', '', '', '', ''];
  }

  return [
    generateSingleWordSRT(wordsData),                  // SRT 1: 1 word at a time
    generateMultiWordSRT(wordsData, 2),                // SRT 2: 2 words at a time
    generateMultiWordSRT(wordsData, 3),                // SRT 3: 3 words at a time
    generateMultiWordSRT(wordsData, 4),                // SRT 4: 4 words at a time
    generateMultiWordSRT(wordsData, 5),                // SRT 5: 5 words at a time
  ];
}

/**
 * Generate SRT from user-edited lyrics with word timing synchronization
 * This handles the case where users have edited the lyrics but we need to maintain timing
 */
export function generateSRTWithEditedLyrics(
  lyrics: Array<{ timestamp: number; text: string }>,
  wordsData: WordData[],
  lyricsWithWords?: Array<{ timestamp: number; text: string; wordIndices: number[] }>
): string[] {
  // If we have the word mapping, use it for accurate timing
  if (lyricsWithWords && wordsData) {
    // Reconstruct word timing based on edited lyrics
    const editedWords: WordData[] = [];
    
    for (const line of lyricsWithWords) {
      if (line.wordIndices.length > 0) {
        // Get the original words for this second
        const originalWords = line.wordIndices
          .map(i => (i >= 0 && i < wordsData.length) ? wordsData[i] : null)
          .filter((w): w is WordData => w !== null);
        
        // Split the edited text into words
        const editedTextWords = line.text.split(/\s+/).filter(t => t.length > 0);
        
        // Map edited words to original timing
        if (originalWords.length > 0 && editedTextWords.length > 0) {
          const firstWord = originalWords[0];
          const lastWord = originalWords[originalWords.length - 1];
          if (firstWord && lastWord) {
            const timePerWord = (lastWord.end - firstWord.start) / editedTextWords.length;
            
            editedTextWords.forEach((word, index) => {
              const startTime = firstWord.start + (index * timePerWord);
              const endTime = startTime + timePerWord;
              
              editedWords.push({
                text: word,
                start: startTime,
                end: Math.min(endTime, lastWord.end),
                type: 'word'
              });
            });
          }
        }
      }
    }
    
    if (editedWords.length > 0) {
      return generateAllSRTVariations(editedWords);
    }
  }
  
  // Fallback: Generate simple SRT from per-second lyrics
  const fallbackSRT = lyrics.map((line, index) => {
    const subtitleNumber = index + 1;
    const startTime = formatSRTTime(line.timestamp);
    const endTime = formatSRTTime(line.timestamp + 1);
    
    return `${subtitleNumber}\n${startTime} --> ${endTime}\n${line.text || ''}\n`;
  }).join('\n').trim();
  
  // Return the same SRT for all 5 variations as fallback
  return [fallbackSRT, fallbackSRT, fallbackSRT, fallbackSRT, fallbackSRT];
}