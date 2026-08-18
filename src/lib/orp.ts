import { ChunkItem, OrpWord } from '@/types';

/**
 * Calculates Spritz-style Optimal Recognition Point (ORP) index in a word.
 * Eye fixation research shows the eye recognizes words fastest when focused
 * roughly 25-35% into the word.
 */
export function getOrpIndex(cleanWordLength: number): number {
  if (cleanWordLength <= 1) return 0;
  if (cleanWordLength <= 5) return 1;
  if (cleanWordLength <= 9) return 2;
  if (cleanWordLength <= 13) return 3;
  return 4;
}

/**
 * Calculates punctuation and length-based delay multiplier for fluid, natural reading rhythm.
 */
export function getDelayMultiplier(word: string, isPunctuationEnabled: boolean = true): number {
  if (!isPunctuationEnabled) return 1.0;

  const trimmed = word.trim();
  if (trimmed.length === 0) return 1.0;

  // Major sentence endings (period, question mark, exclamation, ellipsis)
  if (/[.!?…]$/.test(trimmed) || trimmed.includes('...')) {
    return 1.8;
  }

  // Medium sentence breaks (comma, colon, semicolon, em-dash)
  if (/[,:;—–-]$/.test(trimmed)) {
    return 1.4;
  }

  // Quotation marks or parentheses closing
  if (/["'»\)]$/.test(trimmed)) {
    return 1.25;
  }

  // Very long words take longer for the brain to process
  if (trimmed.length > 12) {
    return 1.3;
  }
  if (trimmed.length > 9) {
    return 1.15;
  }

  return 1.0;
}

/**
 * Parses a single word into its prefix, ORP focal character, and suffix.
 */
export function parseOrpWord(rawWord: string, isPunctuationEnabled: boolean = true): OrpWord {
  if (!rawWord || rawWord.length === 0) {
    return {
      raw: '',
      prefix: '',
      orpChar: '',
      suffix: '',
      orpIndex: 0,
      delayMultiplier: 1.0
    };
  }

  // Find start and end of actual letters/numbers ignoring leading punctuation
  const match = rawWord.match(/^([^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]*)(.*?)([^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]*)$/);
  
  let leading = '';
  let core = rawWord;

  if (match) {
    leading = match[1] || '';
    core = match[2] || '';
  }

  if (core.length === 0) {
    // Pure punctuation or symbol
    return {
      raw: rawWord,
      prefix: '',
      orpChar: rawWord[0] || '',
      suffix: rawWord.slice(1) || '',
      orpIndex: 0,
      delayMultiplier: getDelayMultiplier(rawWord, isPunctuationEnabled)
    };
  }

  const coreOrpIndex = getOrpIndex(core.length);
  const totalOrpIndex = leading.length + coreOrpIndex;

  const prefix = rawWord.slice(0, totalOrpIndex);
  const orpChar = rawWord[totalOrpIndex] || '';
  const suffix = rawWord.slice(totalOrpIndex + 1);

  return {
    raw: rawWord,
    prefix,
    orpChar,
    suffix,
    orpIndex: totalOrpIndex,
    delayMultiplier: getDelayMultiplier(rawWord, isPunctuationEnabled)
  };
}

/**
 * Splits arbitrary text into RSVP chunks (1, 2, or 3 words) with associated ORP metadata.
 */
export function splitIntoChunks(
  text: string,
  chunkSize: number = 1,
  pauseOnPunctuation: boolean = true
): ChunkItem[] {
  if (!text || text.trim().length === 0) return [];

  // Normalize whitespace while preserving paragraphs
  const rawWords = text.trim().split(/\s+/).filter(w => w.length > 0);
  const chunks: ChunkItem[] = [];

  for (let i = 0; i < rawWords.length; i += chunkSize) {
    const slice = rawWords.slice(i, i + chunkSize);
    const chunkWords = slice.map(w => parseOrpWord(w, pauseOnPunctuation));
    const combinedText = slice.join(' ');
    
    // Max delay multiplier of words in chunk
    const maxDelay = Math.max(...chunkWords.map(w => w.delayMultiplier), 1.0);

    chunks.push({
      text: combinedText,
      words: chunkWords,
      isParagraphEnd: combinedText.includes('\n'),
      delayMultiplier: maxDelay
    });
  }

  return chunks;
}

/**
 * Formats seconds into human-readable Turkish time string.
 */
export function formatTimeEstimate(seconds: number): string {
  if (seconds <= 0) return '0 sn';
  if (seconds < 60) return `${Math.ceil(seconds)} sn`;
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = Math.ceil(seconds % 60);
  if (remainingSecs === 0) return `${minutes} dk`;
  return `${minutes} dk ${remainingSecs} sn`;
}

/**
 * Calculates estimated reading time for a word count at a given WPM.
 */
export function estimateReadingTime(wordCount: number, wpm: number): string {
  if (wordCount <= 0 || wpm <= 0) return '0 sn';
  const seconds = (wordCount / wpm) * 60;
  return formatTimeEstimate(seconds);
}

/**
 * Converts a text into Bionic Reading spans where initial letters are bolded.
 */
export function generateBionicWords(text: string): { bold: string; rest: string; raw: string }[] {
  const words = text.split(/(\s+)/);
  return words.map(part => {
    if (/^\s+$/.test(part)) {
      return { bold: '', rest: part, raw: part };
    }
    const cleanMatch = part.match(/^([^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]*)(.*?)([^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]*)$/);
    if (!cleanMatch || !cleanMatch[2]) {
      return { bold: '', rest: part, raw: part };
    }
    const leading = cleanMatch[1] || '';
    const core = cleanMatch[2];
    const trailing = cleanMatch[3] || '';

    const boldCount = Math.ceil(core.length * 0.45);
    const boldPart = leading + core.slice(0, boldCount);
    const restPart = core.slice(boldCount) + trailing;

    return {
      bold: boldPart,
      rest: restPart,
      raw: part
    };
  });
}
