export interface LyricsLine {
  timestamp: number;
  text: string;
}

export function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

export function convertLyricsToSRT(lyrics: LyricsLine[]): string {
  if (!lyrics || lyrics.length === 0) {
    return '';
  }

  const srtLines: string[] = [];
  
  lyrics.forEach((line, index) => {
    const subtitleNumber = index + 1;
    const startTime = formatSRTTime(line.timestamp);
    const endTime = formatSRTTime(line.timestamp + 1);
    
    srtLines.push(String(subtitleNumber));
    srtLines.push(`${startTime} --> ${endTime}`);
    srtLines.push(line.text || '');
    srtLines.push('');
  });
  
  return srtLines.join('\n').trim();
}

export function parseSRT(srtContent: string): LyricsLine[] {
  const lines = srtContent.trim().split('\n');
  const lyrics: LyricsLine[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line && line.includes('-->')) {
      const timeParts = line.split('-->')[0]?.trim() || '';
      const timestamp = parseSRTTime(timeParts);
      const text = lines[i + 1] || '';
      
      lyrics.push({ timestamp, text: text.trim() });
      i += 1;
    }
  }
  
  return lyrics;
}

function parseSRTTime(timeString: string): number {
  const parts = timeString.split(':');
  if (parts.length < 3) return 0;
  
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const secondsParts = parts[2]?.split(',') || ['0', '0'];
  const seconds = parseInt(secondsParts[0] || '0', 10);
  const millis = parseInt(secondsParts[1] || '0', 10) / 1000;
  
  return hours * 3600 + minutes * 60 + seconds + millis;
}

export function splitTextIntoLyrics(text: string, duration: number = 15): LyricsLine[] {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordsPerSecond = Math.ceil(words.length / duration);
  const lyrics: LyricsLine[] = [];
  
  for (let i = 0; i < duration; i++) {
    const startIndex = i * wordsPerSecond;
    const endIndex = Math.min(startIndex + wordsPerSecond, words.length);
    const lineText = words.slice(startIndex, endIndex).join(' ');
    
    lyrics.push({
      timestamp: i,
      text: lineText
    });
  }
  
  return lyrics;
}

export function initializeEmptyLyrics(duration: number = 15): LyricsLine[] {
  const lyrics: LyricsLine[] = [];
  
  for (let i = 0; i < duration; i++) {
    lyrics.push({
      timestamp: i,
      text: ''
    });
  }
  
  return lyrics;
}